<?php

namespace Tests\Feature;

use App\Modules\Identity\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AvatarUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_upload_avatar_to_cloudinary(): void
    {
        Storage::fake('cloudinary');

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $file = UploadedFile::fake()->create('profile.jpg', 100, 'image/jpeg');

        $response = $this->postJson('/api/v1/auth/profile', [
            'avatar' => $file,
        ]);

        $response->assertStatus(200);

        $user->refresh();
        $this->assertNotNull($user->avatar);
        $this->assertStringContainsString('local_biz/avatars', $user->avatar);
    }
}
