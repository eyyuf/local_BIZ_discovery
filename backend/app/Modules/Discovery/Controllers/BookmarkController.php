<?php

namespace App\Modules\Discovery\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Discovery\Actions\ToggleBookmarkAction;
use App\Modules\Discovery\Resources\BookmarkResource;
use App\Modules\Place\Models\Place;
use App\Modules\Review\Contracts\ReviewQueryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    public function index(Request $request, ReviewQueryInterface $reviewQuery): JsonResponse
    {
        $bookmarks = $request->user()
            ->bookmarks()
            ->with('place.images')
            ->latest()
            ->paginate(10);

        $places = $bookmarks->getCollection()->pluck('place')->filter();
        $reviewQuery->attachRatingSummaries($places);

        return BookmarkResource::collection($bookmarks)
            ->additional(['message' => 'retrieved successfully'])
            ->response();
    }

    public function toggle(Request $request, Place $place, ToggleBookmarkAction $action): JsonResponse
    {
        $isBookmarked = $action->execute($request->user(), $place);

        return response()->json([
            'message'    => $isBookmarked
                ? 'Place bookmarked successfully.'
                : 'Bookmark removed successfully.',
            'bookmarked' => $isBookmarked,
        ], 200);
    }
}
