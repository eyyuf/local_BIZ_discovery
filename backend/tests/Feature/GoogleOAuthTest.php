<?php

namespace Tests\Feature;

use App\Modules\Identity\Models\OAuthAccount;
use App\Modules\Identity\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Contracts\User as SocialiteUserContract;
use Laravel\Socialite\Facades\Socialite;
use Mockery;
use Tests\TestCase;

class GoogleOAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_redirect_to_google_initiates_oauth_redirect(): void
    {
        $response = $this->get('/api/v1/auth/google/redirect');

        $response->assertStatus(302);
        $this->assertStringContainsString('accounts.google.com', $response->headers->get('Location'));
    }

    public function test_redirect_to_google_returns_json_when_requested(): void
    {
        $response = $this->getJson('/api/v1/auth/google/redirect');

        $response->assertStatus(200)
            ->assertJsonStructure(['url']);

        $this->assertStringContainsString('accounts.google.com', $response->json('url'));
    }

    public function test_google_callback_signs_in_user_and_redirects_to_auth_me(): void
    {
        $googleId = 'google-id-' . uniqid();
        $email = 'google.user.' . uniqid() . '@example.com';
        $name = 'Jane Google';

        $socialiteUser = Mockery::mock(SocialiteUserContract::class);
        $socialiteUser->shouldReceive('getId')->andReturn($googleId);
        $socialiteUser->shouldReceive('getEmail')->andReturn($email);
        $socialiteUser->shouldReceive('getName')->andReturn($name);
        $socialiteUser->shouldReceive('getAvatar')->andReturn('https://lh3.googleusercontent.com/avatar.jpg');

        $provider = Mockery::mock(Provider::class);
        $provider->shouldReceive('stateless')->andReturnSelf();
        $provider->shouldReceive('user')->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->get('/api/v1/auth/google/callback');

        // 1. Should redirect to /api/v1/auth/me?token=...
        $response->assertStatus(302);
        $location = $response->headers->get('Location');
        $this->assertTrue(
            str_contains($location, '/oauth/callback?token=') || str_contains($location, '/api/v1/auth/me?token=')
        );

        // 2. User should exist in database
        $user = User::where('email', $email)->first();
        $this->assertNotNull($user);
        $this->assertEquals($name, $user->name);

        // 3. OAuth account should exist
        $oauth = OAuthAccount::where('provider', 'google')->where('provider_id', $googleId)->first();
        $this->assertNotNull($oauth);
        $this->assertEquals($user->id, $oauth->user_id);

        // 4. Extract token from redirect URL and test accessing /api/v1/auth/me
        parse_str(parse_url($location, PHP_URL_QUERY), $queryParams);
        $token = $queryParams['token'] ?? null;
        $this->assertNotEmpty($token);

        // Access /api/v1/auth/me using token
        $meResponse = $this->getJson('/api/v1/auth/me?token=' . $token);
        $meResponse->assertStatus(200)
            ->assertJsonPath('data.email', $email)
            ->assertJsonPath('data.name', $name);
    }
}

