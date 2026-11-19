<?php

namespace App\Modules\Review\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Place\Models\Place;
use App\Modules\Review\Actions\GetPlaceRatingSummaryAction;
use App\Modules\Review\Actions\SubmitPlaceRatingAction;
use App\Modules\Review\Models\PlaceRating;
use App\Modules\Review\Requests\SubmitPlaceRatingRequest;
use App\Modules\Review\Resources\PlaceRatingResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class PlaceRatingController extends Controller
{
    /**
     * Display the public rating summary for a place.
     */
    public function show(Place $place, GetPlaceRatingSummaryAction $action): JsonResponse
    {
        $summary = $action->execute($place->id);

        return response()->json([
            'data' => $summary,
        ], 200);
    }

    /**
     * Submit or update a place rating for the authenticated user.
     */
    public function store(
        SubmitPlaceRatingRequest $request,
        Place $place,
        SubmitPlaceRatingAction $action
    ): JsonResponse {
        Gate::authorize('rate', [PlaceRating::class, $place]);

        $rating = $action->execute($place, $request->user(), (int) $request->validated('rating'));

        $statusCode = $rating->wasRecentlyCreated ? 201 : 200;

        return (new PlaceRatingResource($rating))
            ->response()
            ->setStatusCode($statusCode);
    }
}
