<?php

namespace App\Modules\Discovery\Actions;

use App\Modules\Discovery\Models\Category;
use App\Modules\Place\Models\Place;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class GetCategoryPlacesAction
{
    /**
     * Retrieve paginated active places for a category and its active subcategories.
     */
    public function execute(Category $category, int $perPage = 15): LengthAwarePaginator
    {
        // Owns loading only active children for hierarchy traversal and resource serialization
        $category->load(['children' => fn ($query) => $query->where('is_active', true)]);

        // Collect current category ID and active subcategory IDs
        $categoryIds = $category->children->pluck('id')->push($category->id);

        return Place::query()
            ->where('is_active', true)
            ->whereHas('categories', fn ($query) => $query->whereIn('categories.id', $categoryIds))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage);
    }
}
