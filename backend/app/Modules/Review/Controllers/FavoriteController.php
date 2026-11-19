<?php

namespace App\Modules\Review\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Place\Models\Place;
use App\Modules\Review\Actions\AddFavoriteAction;
use App\Modules\Review\Actions\ListFavoritesAction;
use App\Modules\Review\Actions\RemoveFavoriteAction;
use App\Modules\Review\Contracts\ReviewQueryInterface;
use App\Modules\Review\Resources\FavoriteResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    /**
     * Display a paginated listing of the authenticated user's favorites.
     */
    public function index(Request $request,ListFavoritesAction $action,ReviewQueryInterface $reviewQuery): JsonResponse {
        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);
        $favorites = $action->execute($request->user(), $perPage);

        $places = $favorites->getCollection()
            ->pluck('place')
            ->filter();

        $reviewQuery->attachRatingSummaries($places);

        return FavoriteResource::collection($favorites)
            ->additional(['message' => 'Favorites retrieved successfully.'])
            ->response();
    }

    /**
     * Add a place to the authenticated user's favorites.
     */
    public function store(Request $request,Place $place,AddFavoriteAction $action): JsonResponse {
        $favorite = $action->execute($request->user(), $place);
        $favorite->loadMissing('place');

        $statusCode = $favorite->wasRecentlyCreated ? 201 : 200;

        return (new FavoriteResource($favorite))
            ->additional(['message' => 'Place added to favorites successfully.'])
            ->response()
            ->setStatusCode($statusCode);
    }

    /**
     * Remove a place from the authenticated user's favorites.
     */
    public function destroy(Request $request,Place $place,RemoveFavoriteAction $action): JsonResponse {
        $action->execute($request->user(), $place);

        return response()->json([
            'message' => 'Place removed from favorites successfully.',
        ], 200);
    }
}
