<?php

namespace Tests\Feature;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PlaceVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected User $owner;
    protected User $admin;
    protected User $otherUser;
    protected Place $place;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = User::factory()->create([
            'role' => 'owner',
            'email_verified_at' => now(),
        ]);

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $this->otherUser = User::factory()->create([
            'role' => 'owner',
            'email_verified_at' => now(),
        ]);

        $this->place = Place::create([
            'user_id'             => $this->owner->id,
            'name'                => 'Bole Fresh Cafe',
            'slug'                => 'bole-fresh-cafe-' . uniqid(),
            'description'         => 'Specialty Ethiopian coffee and pastries',
            'address'             => 'Bole Medhanialem, Addis Ababa',
            'phone'               => '+251911223344',
            'is_active'           => true,
            'is_verified'         => false,
            'verification_status' => 'unverified',
        ]);
    }

    public function test_owner_can_submit_tin_fayda_and_license_documents_for_review(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->owner);

        $licenseFile = UploadedFile::fake()->create('trade_license.jpg', 300, 'image/jpeg');
        $faydaFile = UploadedFile::fake()->create('fayda_national_id.jpg', 300, 'image/jpeg');

        $response = $this->postJson("/api/v1/owner/places/{$this->place->id}/verify", [
            'verification_type' => 'tin_fayda',
            'tax_id'            => '0012345678',
            'manager_name'      => 'Abebe Bikila',
            'fayda_fin'         => '1234-5678-9012',
            'license_document'  => $licenseFile,
            'fayda_document'    => $faydaFile,
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('place.is_verified', false);
        $response->assertJsonPath('place.verification_status', 'pending');
        $response->assertJsonPath('place.tax_id', '0012345678');
        $response->assertJsonPath('place.manager_name', 'Abebe Bikila');
        $response->assertJsonPath('place.fayda_fin', '1234-5678-9012');

        $this->place->refresh();
        $this->assertFalse($this->place->is_verified);
        $this->assertEquals('pending', $this->place->verification_status);
        $this->assertEquals('0012345678', $this->place->tax_id);
        $this->assertEquals('Abebe Bikila', $this->place->manager_name);
        $this->assertEquals('1234-5678-9012', $this->place->fayda_fin);
        $this->assertNotNull($this->place->verification_document);
        $this->assertNotNull($this->place->fayda_document);
    }

    public function test_owner_can_auto_verify_place_with_telebirr_merchant_id(): void
    {
        Sanctum::actingAs($this->owner);

        $response = $this->postJson("/api/v1/owner/places/{$this->place->id}/verify", [
            'verification_type'    => 'telebirr',
            'telebirr_merchant_id' => '458921',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('place.is_verified', true);
        $response->assertJsonPath('place.verification_status', 'verified');

        $this->place->refresh();
        $this->assertTrue($this->place->is_verified);
        $this->assertEquals('verified', $this->place->verification_status);
        $this->assertEquals('458921', $this->place->telebirr_merchant_id);
        $this->assertNotNull($this->place->verified_at);
    }

    public function test_verification_rejects_invalid_tin_format(): void
    {
        Sanctum::actingAs($this->owner);

        $response = $this->postJson("/api/v1/owner/places/{$this->place->id}/verify", [
            'verification_type' => 'tin_fayda',
            'tax_id'            => '123', // invalid length
            'manager_name'      => 'Abebe Bikila',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['tax_id']);
    }

    public function test_non_owner_cannot_submit_verification(): void
    {
        Sanctum::actingAs($this->otherUser);

        $response = $this->postJson("/api/v1/owner/places/{$this->place->id}/verify", [
            'verification_type'    => 'telebirr',
            'telebirr_merchant_id' => '458921',
        ]);

        $response->assertStatus(403);
    }

    public function test_owner_can_check_verification_status(): void
    {
        $this->place->update([
            'tax_id'                => '0012345678',
            'manager_name'          => 'Abebe Bikila',
            'fayda_fin'             => '1234-5678-9012',
            'verification_document' => 'verifications/licenses/lic.jpg',
            'fayda_document'        => 'verifications/fayda/id.jpg',
            'verification_status'   => 'pending',
        ]);

        Sanctum::actingAs($this->owner);

        $response = $this->getJson("/api/v1/owner/places/{$this->place->id}/verification-status");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'place_id',
            'place_name',
            'is_verified',
            'verification_status',
            'tax_id',
            'manager_name',
            'fayda_fin',
            'verification_document',
            'fayda_document',
            'verified_at',
            'fayda_validator_url',
        ]);
        $response->assertJsonPath('fayda_validator_url', 'https://fayda.et');
    }

    public function test_admin_can_view_pending_verifications_list(): void
    {
        $this->place->update([
            'verification_status' => 'pending',
            'tax_id'              => '0012345678',
            'manager_name'        => 'Abebe Bikila',
        ]);

        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/v1/admin/places/pending-verifications');

        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'Bole Fresh Cafe']);
        $response->assertJsonFragment(['manager_name' => 'Abebe Bikila']);
    }

    public function test_non_admin_cannot_view_pending_verifications(): void
    {
        Sanctum::actingAs($this->owner);

        $response = $this->getJson('/api/v1/admin/places/pending-verifications');

        $response->assertStatus(403);
    }

    public function test_admin_can_approve_place_verification(): void
    {
        $this->place->update([
            'verification_status' => 'pending',
            'tax_id'              => '0012345678',
            'manager_name'        => 'Abebe Bikila',
        ]);

        Sanctum::actingAs($this->admin);

        $response = $this->postJson("/api/v1/admin/places/{$this->place->id}/review", [
            'decision' => 'approved',
            'notes'    => 'Trade License and Fayda ID QR code verified successfully on fayda.et',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('place.is_verified', true);
        $response->assertJsonPath('place.verification_status', 'verified');

        $this->place->refresh();
        $this->assertTrue($this->place->is_verified);
        $this->assertEquals('verified', $this->place->verification_status);
        $this->assertNotNull($this->place->verified_at);
        $this->assertEquals(
            'Trade License and Fayda ID QR code verified successfully on fayda.et',
            $this->place->verification_notes
        );
    }

    public function test_admin_can_reject_place_verification(): void
    {
        $this->place->update([
            'verification_status' => 'pending',
        ]);

        Sanctum::actingAs($this->admin);

        $response = $this->postJson("/api/v1/admin/places/{$this->place->id}/review", [
            'decision' => 'rejected',
            'notes'    => 'Fayda ID QR code unreadable or name does not match trade license general manager',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('place.is_verified', false);
        $response->assertJsonPath('place.verification_status', 'rejected');

        $this->place->refresh();
        $this->assertFalse($this->place->is_verified);
        $this->assertEquals('rejected', $this->place->verification_status);
    }

    public function test_public_place_detail_shows_is_verified_true_when_approved(): void
    {
        $this->place->update([
            'is_verified'         => true,
            'verification_status' => 'verified',
            'verified_at'         => now(),
        ]);

        $response = $this->getJson("/api/v1/places/{$this->place->slug}");

        $response->assertStatus(200);
        $response->assertJsonPath('data.is_verified', true);
        $response->assertJsonPath('data.verification_status', 'verified');
    }
}
