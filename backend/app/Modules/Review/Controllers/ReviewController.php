<?php

namespace App\Modules\Review\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Place\Models\Place;
use App\Modules\Review\Actions\CreateReviewAction;
use App\Modules\Review\Actions\DeleteReviewAction;
use App\Modules\Review\Actions\ListPlaceReviewsAction;
use App\Modules\Review\Actions\ShowReviewAction;
use App\Modules\Review\Actions\UpdateReviewAction;
use App\Modules\Review\Models\Review;
use App\Modules\Review\Requests\CreateReviewRequest;
use App\Modules\Review\Requests\UpdateReviewRequest;
use App\Modules\Review\Resources\ReviewResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ReviewController extends Controller
{
    /**
     * Display a paginated listing of published reviews for a place.
     */
    public function index(Request $request, Place $place, ListPlaceReviewsAction $action): JsonResponse
    {
        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);
        $reviews = $action->execute($place, $perPage);

        return ReviewResource::collection($reviews)->response();
    }

    /**
     * Display a single published review.
     */
    public function show(Review $review, ShowReviewAction $action): JsonResponse
    {
        $review = $action->execute($review);

        return (new ReviewResource($review))->response();
    }

    /**
     * Create a new written review for a place.
     */
    public function store(CreateReviewRequest $request, Place $place, CreateReviewAction $action): JsonResponse
    {
        Gate::authorize('create', [Review::class, $place]);

        $review = $action->execute($place, $request->user(), $request->validated());

        return (new ReviewResource($review))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update an existing written review.
     */
    public function update(UpdateReviewRequest $request, Review $review, UpdateReviewAction $action): JsonResponse
    {
        Gate::authorize('update', $review);

        $review = $action->execute($review, $request->validated());

        return (new ReviewResource($review))->response();
    }

    /**
     * Delete an existing written review.
     */
    public function destroy(Review $review, DeleteReviewAction $action): JsonResponse
    {
        Gate::authorize('delete', $review);

        $action->execute($review);

        return response()->json([
            'message' => 'Review deleted successfully.',
        ], 200);
    }
}
