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
            'description'         => 'Specialty Ethiopian coffee',
            'address'             => 'Bole Medhanialem, Addis Ababa',
            'phone'               => '+251911223344',
            'is_active'           => true,
            'is_verified'         => false,
            'verification_status' => 'unverified',
        ]);
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
        $response->assertJsonPath('place.telebirr_merchant_id', '458921');

        $this->place->refresh();
        $this->assertTrue($this->place->is_verified);
        $this->assertEquals('verified', $this->place->verification_status);
        $this->assertNotNull($this->place->verified_at);
    }

    public function test_telebirr_verification_rejects_invalid_shortcode_format(): void
    {
        Sanctum::actingAs($this->owner);

        $response = $this->postJson("/api/v1/owner/places/{$this->place->id}/verify", [
            'verification_type'    => 'telebirr',
            'telebirr_merchant_id' => '12',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['telebirr_merchant_id']);
    }

    public function test_owner_can_submit_document_verification_for_admin_review(): void
    {
        Storage::fake('cloudinary');
        Storage::fake('public');
        Sanctum::actingAs($this->owner);

        $file = UploadedFile::fake()->create('etrade_license.jpg', 300, 'image/jpeg');

        $response = $this->postJson("/api/v1/owner/places/{$this->place->id}/verify", [
            'verification_type' => 'document',
            'document'          => $file,
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('place.is_verified', false);
        $response->assertJsonPath('place.verification_status', 'pending');

        $this->place->refresh();
        $this->assertFalse($this->place->is_verified);
        $this->assertEquals('pending', $this->place->verification_status);
        $this->assertNotNull($this->place->verification_document);
    }

    public function test_owner_can_submit_tin_for_review(): void
    {
        Sanctum::actingAs($this->owner);

        $response = $this->postJson("/api/v1/owner/places/{$this->place->id}/verify", [
            'verification_type' => 'tin',
            'tax_id'            => '0012345678',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('place.verification_status', 'pending');

        $this->place->refresh();
        $this->assertEquals('0012345678', $this->place->tax_id);
        $this->assertEquals('pending', $this->place->verification_status);
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
        Sanctum::actingAs($this->owner);

        $response = $this->getJson("/api/v1/owner/places/{$this->place->id}/verification-status");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'place_id',
            'is_verified',
            'verification_status',
            'verified_at',
            'telebirr_merchant_id',
            'tax_id',
            'verification_document',
            'verification_notes',
        ]);
    }

    public function test_admin_can_view_pending_verifications(): void
    {
        $this->place->update(['verification_status' => 'pending']);

        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/v1/admin/places/pending-verifications');

        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'Bole Fresh Cafe']);
    }

    public function test_non_admin_cannot_view_pending_verifications(): void
    {
        Sanctum::actingAs($this->owner);

        $response = $this->getJson('/api/v1/admin/places/pending-verifications');

        $response->assertStatus(403);
    }

    public function test_admin_can_approve_place_verification(): void
    {
        $this->place->update(['verification_status' => 'pending']);

        Sanctum::actingAs($this->admin);

        $response = $this->postJson("/api/v1/admin/places/{$this->place->id}/verify", [
            'decision' => 'approved',
            'notes'    => 'eTrade license verified on etrade.gov.et',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('place.is_verified', true);
        $response->assertJsonPath('place.verification_status', 'verified');

        $this->place->refresh();
        $this->assertTrue($this->place->is_verified);
        $this->assertEquals('verified', $this->place->verification_status);
        $this->assertEquals('eTrade license verified on etrade.gov.et', $this->place->verification_notes);
    }

    public function test_admin_can_reject_place_verification(): void
    {
        $this->place->update(['verification_status' => 'pending']);

        Sanctum::actingAs($this->admin);

        $response = $this->postJson("/api/v1/admin/places/{$this->place->id}/verify", [
            'decision' => 'rejected',
            'notes'    => 'License image was blurry and unreadable',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('place.is_verified', false);
        $response->assertJsonPath('place.verification_status', 'rejected');

        $this->place->refresh();
        $this->assertFalse($this->place->is_verified);
        $this->assertEquals('rejected', $this->place->verification_status);
        $this->assertEquals('License image was blurry and unreadable', $this->place->verification_notes);
    }
}
