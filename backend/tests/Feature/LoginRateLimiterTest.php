<?php

namespace Tests\Feature;

use App\Modules\Identity\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class LoginRateLimiterTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_rate_limiter_locks_out_after_too_many_failed_attempts(): void
    {
        $user = User::factory()->create([
            'email' => 'test-ratelimit@example.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        RateLimiter::clear('test-ratelimit@example.com|127.0.0.1');

        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/v1/auth/login', [
                'email' => 'test-ratelimit@example.com',
                'password' => 'wrong-password',
            ]);

            $response->assertStatus(422);
            $response->assertJsonValidationErrors(['email']);
        }

        $blockedResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'test-ratelimit@example.com',
            'password' => 'wrong-password',
        ]);

        $blockedResponse->assertStatus(429);
        $blockedResponse->assertJsonValidationErrors(['email']);
    }

    public function test_successful_login_clears_rate_limiter(): void
    {
        $user = User::factory()->create([
            'email' => 'test-success@example.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        RateLimiter::clear('test-success@example.com|127.0.0.1');

        $this->postJson('/api/v1/auth/login', [
            'email' => 'test-success@example.com',
            'password' => 'wrong-password',
        ])->assertStatus(422);

        $successResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'test-success@example.com',
            'password' => 'password123',
        ]);

        $successResponse->assertStatus(200);
        $successResponse->assertJsonStructure(['token', 'user']);
    }
}
