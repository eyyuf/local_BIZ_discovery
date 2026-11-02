<?php

namespace App\Modules\Discovery\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Discovery\Actions\ToggleBookmarkAction;
use App\Modules\Discovery\Resources\BookmarkResource;
use App\Modules\Place\Models\Place;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $bookmarks = $request->user()
            ->bookmarks()
            ->with('place')
            ->latest()
            ->paginate(10);

        return response()->json([
            'message' => 'retrieved successfully',
            'data'    => BookmarkResource::collection($bookmarks),
        ], 200);
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
