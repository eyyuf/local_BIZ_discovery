<?php

namespace Tests\Feature;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use App\Modules\Social\Models\DealClaim;
use App\Modules\Social\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SocialFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected User $owner;
    protected User $customer;
    protected Place $place;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = User::factory()->create();
        $this->customer = User::factory()->create();

        $this->place = Place::create([
            'user_id'     => $this->owner->id,
            'name'        => 'Sunrise Cafe ' . uniqid(),
            'slug'        => 'sunrise-cafe-' . uniqid(),
            'description' => 'Best coffee in town',
            'address'     => '123 Coffee Lane',
            'latitude'    => 40.7128,
            'longitude'   => -74.0060,
            'phone'       => '555-1234',
            'is_active'   => true,
        ]);
    }

    public function test_owner_can_publish_a_deal_post(): void
    {
        $response = $this->actingAs($this->owner)
            ->postJson("/api/v1/social/places/{$this->place->id}/posts", [
                'title'               => 'Happy Hour Lattes',
                'content'             => '20% off all lattes today',
                'deal_type'           => 'deal',
                'discount_percentage' => 20,
                'discount_code'       => 'LATTE20',
                'max_claims'          => 10,
                'expires_at'          => now()->addDays(2)->toDateTimeString(),
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Happy Hour Lattes')
            ->assertJsonPath('data.discount_percentage', 20)
            ->assertJsonPath('data.discount_code', 'LATTE20')
            ->assertJsonPath('data.max_claims', 10);

        $this->assertDatabaseHas('posts', [
            'place_id' => $this->place->id,
            'title'    => 'Happy Hour Lattes',
        ]);
    }

    public function test_non_owner_cannot_publish_post_for_place(): void
    {
        $response = $this->actingAs($this->customer)
            ->postJson("/api/v1/social/places/{$this->place->id}/posts", [
                'title'   => 'Unauthorized Deal',
                'content' => 'This should fail',
            ]);

        $response->assertStatus(403);
    }

    public function test_public_can_browse_active_deals_feed(): void
    {
        Post::create([
            'place_id'            => $this->place->id,
            'user_id'             => $this->owner->id,
            'title'               => 'Fresh Croissants Deal',
            'content'             => 'Buy 1 Get 1 Free',
            'deal_type'           => 'deal',
            'discount_percentage' => 50,
            'is_active'           => true,
        ]);

        $response = $this->getJson('/api/v1/social/deals');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'title', 'place', 'author']]]);
    }

    public function test_authenticated_user_can_toggle_like_on_post(): void
    {
        $post = Post::create([
            'place_id'    => $this->place->id,
            'user_id'     => $this->owner->id,
            'title'       => 'Special Event',
            'content'     => 'Live music tonight',
            'is_active'   => true,
            'likes_count' => 0,
        ]);

        // 1. Like
        $likeResponse = $this->actingAs($this->customer)
            ->postJson("/api/v1/social/posts/{$post->id}/like");

        $likeResponse->assertStatus(200)
            ->assertJsonPath('liked', true)
            ->assertJsonPath('likes_count', 1);

        $this->assertDatabaseHas('post_likes', [
            'post_id' => $post->id,
            'user_id' => $this->customer->id,
        ]);

        // 2. Unlike
        $unlikeResponse = $this->actingAs($this->customer)
            ->postJson("/api/v1/social/posts/{$post->id}/like");

        $unlikeResponse->assertStatus(200)
            ->assertJsonPath('liked', false)
            ->assertJsonPath('likes_count', 0);
    }

    public function test_user_can_claim_deal_voucher_and_redeem_at_table(): void
    {
        $post = Post::create([
            'place_id'            => $this->place->id,
            'user_id'             => $this->owner->id,
            'title'               => '20% Off Brunch',
            'content'             => 'Show code to your waiter',
            'discount_percentage' => 20,
            'max_claims'          => 50,
            'claims_count'        => 0,
            'is_active'           => true,
            'expires_at'          => now()->addDays(1),
        ]);

        // 1. Claim Deal
        $claimResponse = $this->actingAs($this->customer)
            ->postJson("/api/v1/social/posts/{$post->id}/claim");

        $claimResponse->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'voucher_code', 'status']])
            ->assertJsonPath('data.status', 'claimed');

        $claimId = $claimResponse->json('data.id');

        // 2. Cannot claim twice
        $duplicateResponse = $this->actingAs($this->customer)
            ->postJson("/api/v1/social/posts/{$post->id}/claim");

        $duplicateResponse->assertStatus(422);

        // 3. Redeem voucher
        $redeemResponse = $this->actingAs($this->customer)
            ->postJson("/api/v1/social/claims/{$claimId}/redeem");

        $redeemResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'redeemed');

        $this->assertDatabaseHas('deal_claims', [
            'id'     => $claimId,
            'status' => 'redeemed',
        ]);
    }
}

