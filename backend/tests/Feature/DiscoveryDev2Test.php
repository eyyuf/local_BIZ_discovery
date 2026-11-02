<?php

namespace Tests\Feature;

use App\Modules\Discovery\Models\Category;
use App\Modules\Discovery\Models\PlaceBookmark;
use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class DiscoveryDev2Test extends TestCase
{
    use DatabaseTransactions;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    /** Helper to create an active test place with unique slug */
    protected function createPlace(array $overrides = []): Place
    {
        return Place::create(array_merge([
            'user_id'     => $this->user->id,
            'name'        => 'Test Place ' . uniqid(),
            'slug'        => 'test-place-' . uniqid(),
            'description' => 'Test place description',
            'address'     => '123 Main Street',
            'latitude'    => 40.7128,
            'longitude'   => -74.0060,
            'phone'       => '555-1234',
            'website'     => 'https://example.com',
            'is_active'   => true,
        ], $overrides));
    }

    // ==========================================
    // 1. BOOKMARKS TESTS
    // ==========================================

    public function test_authenticated_user_can_toggle_save_a_place(): void
    {
        $place = $this->createPlace();

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/discovery/bookmarks/{$place->id}");

        $response->assertStatus(200)
            ->assertJson([
                'bookmarked' => true,
                'message'    => 'Place bookmarked successfully.',
            ]);

        $this->assertDatabaseHas('place_bookmarks', [
            'user_id'  => $this->user->id,
            'place_id' => $place->id,
        ]);
    }

    public function test_toggling_again_removes_the_bookmark(): void
    {
        $place = $this->createPlace();

        // First tap: save
        $this->actingAs($this->user)->postJson("/api/v1/discovery/bookmarks/{$place->id}");

        // Second tap: unsave
        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/discovery/bookmarks/{$place->id}");

        $response->assertStatus(200)
            ->assertJson([
                'bookmarked' => false,
                'message'    => 'Bookmark removed successfully.',
            ]);

        $this->assertDatabaseMissing('place_bookmarks', [
            'user_id'  => $this->user->id,
            'place_id' => $place->id,
        ]);
    }

    public function test_user_can_fetch_their_paginated_list_of_bookmarks(): void
    {
        $place = $this->createPlace();

        PlaceBookmark::create([
            'user_id'  => $this->user->id,
            'place_id' => $place->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/discovery/bookmarks');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'place',
                        'created_at',
                    ],
                ],
            ]);
    }

    public function test_unauthenticated_guest_cannot_access_bookmarks(): void
    {
        $place = $this->createPlace();

        $this->postJson("/api/v1/discovery/bookmarks/{$place->id}")
            ->assertStatus(401);

        $this->getJson('/api/v1/discovery/bookmarks')
            ->assertStatus(401);
    }

    // ==========================================
    // 2. AUTOCOMPLETE SUGGESTIONS TESTS
    // ==========================================

    public function test_suggestions_endpoint_returns_matching_categories_and_places(): void
    {
        $category = Category::create([
            'name'      => 'Artisan Cafes',
            'slug'      => 'artisan-cafes-' . uniqid(),
            'is_active' => true,
        ]);

        $place = $this->createPlace([
            'name' => 'Blue Bottle Cafe ' . uniqid(),
            'slug' => 'blue-bottle-cafe-' . uniqid(),
        ]);

        $response = $this->getJson('/api/v1/discovery/suggestions?q=cafe');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data' => [
                    '*' => ['type', 'id', 'label', 'slug'],
                ],
            ]);

        $types = collect($response->json('data'))->pluck('type');
        $this->assertTrue($types->contains('category'));
        $this->assertTrue($types->contains('place'));
    }

    public function test_suggestions_validation_fails_on_empty_query(): void
    {
        $response = $this->getJson('/api/v1/discovery/suggestions?q=');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['q']);
    }

    // ==========================================
    // 3. MULTI-FILTER SEARCH TESTS
    // ==========================================

    public function test_search_filters_by_keyword_in_name_and_description(): void
    {
        $matchingByName = $this->createPlace([
            'name'        => 'Superb Pizzeria ' . uniqid(),
            'description' => 'Serving pasta and salad',
        ]);

        $matchingByDesc = $this->createPlace([
            'name'        => 'Trattoria Bella ' . uniqid(),
            'description' => 'Best artisan pizzeria in the city',
        ]);

        $notMatching = $this->createPlace([
            'name'        => 'Tokyo Sushi ' . uniqid(),
            'description' => 'Only fresh sashimi',
        ]);

        $response = $this->getJson('/api/v1/discovery/search?q=pizzeria');

        $response->assertStatus(200);

        $ids = collect($response->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($matchingByName->id));
        $this->assertTrue($ids->contains($matchingByDesc->id));
        $this->assertFalse($ids->contains($notMatching->id));
    }

    public function test_search_filters_by_category_slug(): void
    {
        $category = Category::create([
            'name'      => 'Italian Food',
            'slug'      => 'italian-food-' . uniqid(),
            'is_active' => true,
        ]);

        $placeWithCategory = $this->createPlace();
        $placeWithCategory->categories()->attach($category->id);

        $placeWithoutCategory = $this->createPlace();

        $response = $this->getJson("/api/v1/discovery/search?category={$category->slug}");

        $response->assertStatus(200);

        $ids = collect($response->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($placeWithCategory->id));
        $this->assertFalse($ids->contains($placeWithoutCategory->id));
    }

    public function test_search_calculates_distance_and_filters_within_radius(): void
    {
        // Reference point: Times Square NYC (40.7580, -73.9855)
        $userLat = 40.7580;
        $userLng = -73.9855;

        // Place within 1 km (40.7590, -73.9845)
        $nearbyPlace = $this->createPlace([
            'latitude'  => 40.7590,
            'longitude' => -73.9845,
        ]);

        // Place far away in Queens (~15 km away: 40.7282, -73.7949)
        $farPlace = $this->createPlace([
            'latitude'  => 40.7282,
            'longitude' => -73.7949,
        ]);

        $response = $this->getJson("/api/v1/discovery/search?lat={$userLat}&lng={$userLng}&radius=5");

        $response->assertStatus(200);

        $data = collect($response->json('data'));
        $ids = $data->pluck('id');

        $this->assertTrue($ids->contains($nearbyPlace->id));
        $this->assertFalse($ids->contains($farPlace->id));

        // Verify distance_km is attached and accurate
        $nearbyResult = $data->firstWhere('id', $nearbyPlace->id);
        $this->assertNotNull($nearbyResult['distance_km']);
        $this->assertLessThan(2.0, $nearbyResult['distance_km']);
    }

    public function test_search_sorts_by_distance_nearest_first(): void
    {
        $userLat = 40.7580;
        $userLng = -73.9855;

        // Place 1: ~100m away
        $closestPlace = $this->createPlace([
            'latitude'  => 40.7585,
            'longitude' => -73.9850,
        ]);

        // Place 2: ~3 km away
        $furtherPlace = $this->createPlace([
            'latitude'  => 40.7800,
            'longitude' => -73.9700,
        ]);

        $response = $this->getJson("/api/v1/discovery/search?lat={$userLat}&lng={$userLng}&sort_by=distance");

        $response->assertStatus(200);

        $results = collect($response->json('data'));
        $closestIndex = $results->search(fn ($p) => $p['id'] === $closestPlace->id);
        $furtherIndex = $results->search(fn ($p) => $p['id'] === $furtherPlace->id);

        $this->assertLessThan($furtherIndex, $closestIndex);
    }
}
