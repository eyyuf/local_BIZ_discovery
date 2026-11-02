<?php

namespace App\Modules\Discovery\Actions;

use App\Modules\Discovery\Models\Category;
use App\Modules\Place\Models\Place;

class GetSearchSuggestionsAction
{
    /**
     * Fetch matching places and categories for instant autocomplete dropdown.
     *
     * @param string $query
     * @param int $limit
     * @return array
     */
    public function execute(string $query, int $limit = 10): array
    {
        
        $limit = max(1, min($limit, 15));

     
        $categories = Category::query()
            ->where('is_active', true)
            ->where('name', 'ILIKE', "%{$query}%")
            ->limit($limit)
            ->get(['id', 'name', 'slug'])
            ->map(fn (Category $category) => [
                'type'  => 'category',
                'id'    => $category->id,
                'label' => $category->name,
                'slug'  => $category->slug,
            ]);

      
        $places = Place::query()
            ->where('is_active', true)
            ->where('name', 'ILIKE', "%{$query}%")
            ->limit($limit)
            ->get(['id', 'name', 'slug'])
            ->map(fn (Place $place) => [
                'type'  => 'place',
                'id'    => $place->id,
                'label' => $place->name,
                'slug'  => $place->slug,
            ]);

        $results = $categories->concat($places)
            ->take($limit)
            ->values()
            ->all();

        return [
            'suggestions' => $results,
        ];
    }
}