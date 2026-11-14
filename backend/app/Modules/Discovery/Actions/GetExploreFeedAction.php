<?php

namespace App\Modules\Discovery\Actions;

use App\Modules\Discovery\Models\Category;
use App\Modules\Place\Models\Place;

class GetExploreFeedAction
{
    /**
     * Assemble curated explore feed sections.
     *
     * @return array<int, array<string, mixed>>
     */
    public function execute(?float $lat = null, ?float $lng = null): array
    {
        return [
            $this->getNearbyPopularSection($lat, $lng),
            $this->getFeaturedCategoriesSection(),
            $this->getNewAdditionsSection(),
        ];
    }

    /**
     * Section 1: Nearby active places if coordinates are given, otherwise popular active places.
     *
     * @return array<string, mixed>
     */
    protected function getNearbyPopularSection(?float $lat, ?float $lng): array
    {
        if ($lat !== null && $lng !== null) {
            $places = Place::query()
                ->where('is_active', true)
                ->with('images')
                ->withinRadius($lat, $lng, 50.0)
                ->withDistanceTo($lat, $lng)
                ->orderBy('distance_km', 'asc')
                ->limit(10)
                ->get();

            $description = 'Places near your current location';
        } else {
            $places = Place::query()
                ->where('is_active', true)
                ->with('images')
                ->withCount('bookmarks')
                ->orderByDesc('bookmarks_count')
                ->orderByDesc('created_at')
                ->orderByDesc('id')
                ->limit(10)
                ->get();

            $description = 'Popular spots recommended for you';
        }

        return [
            'key'         => 'nearby_popular',
            'title'       => 'Nearby & Popular',
            'description' => $description,
            'places'      => $places,
        ];
    }

    /**
     * Section 2: Active root categories with their active child categories.
     *
     * @return array<string, mixed>
     */
    protected function getFeaturedCategoriesSection(): array
    {
        $categories = Category::query()
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->with(['children' => fn ($query) => $query->where('is_active', true)])
            ->orderBy('name', 'asc')
            ->get();

        return [
            'key'         => 'featured_categories',
            'title'       => 'Featured Categories',
            'description' => 'Browse local spots by category',
            'categories'  => $categories,
        ];
    }

    /**
     * Section 3: Ten latest active places.
     *
     * @return array<string, mixed>
     */
    protected function getNewAdditionsSection(): array
    {
        $places = Place::query()
            ->where('is_active', true)
            ->with('images')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(10)
            ->get();

        return [
            'key'         => 'new_additions',
            'title'       => 'New Additions',
            'description' => 'Recently added local businesses',
            'places'      => $places,
        ];
    }
}
