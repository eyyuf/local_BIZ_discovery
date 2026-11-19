<?php

namespace Tests\Feature;

use App\Modules\Identity\Models\User;
use App\Modules\Identity\Notifications\AccountLockedRescueNotification;
use App\Modules\Place\Models\Place;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class AccountLockoutAndUpgradeTest extends TestCase
{
    use RefreshDatabase;

    public function test_account_locks_and_dispatches_notification_after_5_failed_attempts(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'lockout@example.com',
            'password' => Hash::make('correct-password'),
            'email_verified_at' => now(),
            'locked_at' => null,
        ]);

        RateLimiter::clear('lockout@example.com|127.0.0.1');

        for ($i = 0; $i < 4; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'email' => 'lockout@example.com',
                'password' => 'wrong-pass',
            ])->assertStatus(422);
        }

        $fifthAttempt = $this->postJson('/api/v1/auth/login', [
            'email' => 'lockout@example.com',
            'password' => 'wrong-pass',
        ]);

        $fifthAttempt->assertStatus(423);
        $this->assertNotNull($user->fresh()->locked_at);

        Notification::assertSentTo($user, AccountLockedRescueNotification::class);
    }

    public function test_magic_login_clears_lockout_and_authenticates(): void
    {
        $user = User::factory()->create([
            'email' => 'magic@example.com',
            'locked_at' => now(),
            'email_verified_at' => now(),
        ]);

        $magicUrl = URL::temporarySignedRoute(
            'auth.magic-login',
            now()->addMinutes(30),
            ['id' => $user->id]
        );

        $response = $this->getJson($magicUrl);

        $response->assertStatus(200);
        $response->assertJsonStructure(['message', 'token', 'user']);
        $this->assertNull($user->fresh()->locked_at);
        $this->assertAuthenticatedAs($user);
    }

    public function test_magic_login_fails_with_invalid_signature(): void
    {
        $user = User::factory()->create([
            'email' => 'tampered@example.com',
            'locked_at' => now(),
        ]);

        $tamperedUrl = url("/api/v1/auth/magic-login/{$user->id}?signature=invalid");

        $response = $this->getJson($tamperedUrl);
        $response->assertStatus(401);
    }

    public function test_customer_registration_defaults_to_customer_and_is_auto_verified(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'John Customer',
            'email' => 'customer@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('user.role', 'customer');

        $user = User::where('email', 'customer@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('customer', $user->role);
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_owner_registration_requires_email_verification(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Jane Owner',
            'email' => 'owner@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'role' => 'owner',
        ]);

        $response->assertStatus(201);
        $user = User::where('email', 'owner@example.com')->first();
        $this->assertNull($user->email_verified_at);

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'owner@example.com',
            'password' => 'SecurePass123!',
        ]);

        $loginResponse->assertStatus(422);
        $loginResponse->assertJsonValidationErrors(['email']);
    }

    public function test_authenticated_customer_can_upgrade_to_owner(): void
    {
        $customer = User::factory()->create([
            'email' => 'upgrading@example.com',
            'role' => 'customer',
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($customer, 'sanctum')->postJson('/api/v1/auth/upgrade-to-owner', [
            'business_name' => 'Acme Coffee Roasters',
            'phone' => '+15551234567',
            'address' => '123 Main St, Springfield',
            'description' => 'Artisanal micro-roastery and cafe',
            'website' => 'https://acmecoffee.com',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('user.role', 'owner');
        $response->assertJsonPath('place.name', 'Acme Coffee Roasters');
        $response->assertJsonPath('place.address', '123 Main St, Springfield');

        $this->assertEquals('owner', $customer->fresh()->role);
        $this->assertDatabaseHas('places', [
            'user_id' => $customer->id,
            'name' => 'Acme Coffee Roasters',
        ]);
    }

    public function test_upgrade_to_owner_requires_valid_data(): void
    {
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        $response = $this->actingAs($customer, 'sanctum')->postJson('/api/v1/auth/upgrade-to-owner', [
            'business_name' => '',
            'phone' => '',
            'address' => '',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['business_name', 'phone', 'address']);
    }
}
