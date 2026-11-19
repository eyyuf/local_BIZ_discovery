<?php

namespace App\Modules\Review\Services;

use App\Modules\Place\Models\Place;
use App\Modules\Review\Actions\GetPlaceRatingSummaryAction;
use App\Modules\Review\Contracts\ReviewQueryInterface;
use App\Modules\Review\Models\PlaceRating;
use App\Modules\Review\Models\Review;
use Illuminate\Pagination\AbstractPaginator;
use Illuminate\Support\Collection;

class ReviewQueryService implements ReviewQueryInterface
{
    public function __construct(
        private ?GetPlaceRatingSummaryAction $summaryAction = null
    ) {
        $this->summaryAction ??= new GetPlaceRatingSummaryAction();
    }

    public function getPlaceAverageRating(int $placeId): ?float
    {
        return $this->getPlaceRatingSummary($placeId)['average_rating'];
    }

    public function getPlaceReviewCount(int $placeId): int
    {
        return Review::query()
            ->where('place_id', $placeId)
            ->where('is_published', true)
            ->count();
    }

    public function hasUserReviewedPlace(int $userId, int $placeId): bool
    {
        return Review::query()
            ->where('place_id', $placeId)
            ->where('user_id', $userId)
            ->exists();
    }

    public function getPlaceRatingSummary(int $placeId): array
    {
        return $this->summaryAction->execute($placeId);
    }

    /**
     * Batch attach rating summaries to a single Place, Collection, or Paginator in 1 database query.
     */
    public function attachRatingSummaries(mixed $places): void
    {
        $items = match (true) {
            $places instanceof AbstractPaginator => $places->items(),
            $places instanceof Collection => $places->all(),
            is_array($places) => $places,
            $places instanceof Place => [$places],
            default => [],
        };

        if (empty($items)) {
            return;
        }

        $placeIds = array_filter(array_map(fn ($item) => $item instanceof Place ? $item->id : null, $items));
        if (empty($placeIds)) {
            return;
        }

        $cutoff = now()->subDays(GetPlaceRatingSummaryAction::ELIGIBILITY_DAYS_THRESHOLD);

        $results = PlaceRating::query()
            ->whereIn('place_ratings.place_id', $placeIds)
            ->join('users', 'users.id', '=', 'place_ratings.user_id')
            ->where('users.created_at', '<=', $cutoff)
            ->groupBy('place_ratings.place_id')
            ->selectRaw('place_ratings.place_id, COUNT(*) as total_ratings, AVG(place_ratings.rating) as avg_rating')
            ->get()
            ->keyBy('place_id');

        foreach ($items as $place) {
            if (! $place instanceof Place) {
                continue;
            }

            $agg = $results->get($place->id);
            $total = (int) ($agg->total_ratings ?? 0);
            $avg = ($total >= GetPlaceRatingSummaryAction::MINIMUM_RATINGS_THRESHOLD && $agg->avg_rating !== null)
                ? round((float) $agg->avg_rating, 1)
                : null;

            $place->setAttribute('total_ratings', $total);
            $place->setAttribute('average_rating', $avg);
        }
    }
}
