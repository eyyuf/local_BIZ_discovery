<?php

namespace Tests\Feature;

use App\Modules\Identity\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MediaUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_upload_image(): void
    {
        Storage::fake('cloudinary');

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $file = UploadedFile::fake()->create('menu_item.jpg', 200, 'image/jpeg');

        $response = $this->postJson('/api/v1/media/upload', [
            'image'  => $file,
            'folder' => 'menus',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'url',
                'path',
            ]);

        $this->assertStringContainsString('local_biz/menus', $response->json('path'));
    }

    public function test_unauthenticated_user_cannot_upload(): void
    {
        $file = UploadedFile::fake()->create('image.jpg', 100, 'image/jpeg');

        $response = $this->postJson('/api/v1/media/upload', [
            'image' => $file,
        ]);

        $response->assertStatus(401);
    }
}
