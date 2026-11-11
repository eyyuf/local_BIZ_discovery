<?php

namespace App\Modules\Review\Actions;

use App\Modules\Place\Models\Place;
use App\Modules\Review\Models\Review;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListPlaceReviewsAction
{
    /**
     * Retrieve paginated published reviews for a given place.
     */
    public function execute(Place $place, int $perPage = 15): LengthAwarePaginator
    {
        return Review::query()
            ->where('place_id', $place->id)
            ->where('is_published', true)
            ->with([
                'author'          => fn ($query) => $query->select(['id', 'name', 'avatar']),
                'messages.author' => fn ($query) => $query->select(['id', 'name', 'avatar']),
            ])
            ->latest()
            ->paginate($perPage);
    }
}
