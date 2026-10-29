<?php

namespace App\Modules\Discovery\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Discovery\Actions\ToggleBookmarkAction;
use App\Modules\Place\Models\Place;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // TODO: Return paginated saved places for authenticated user
    }

    public function toggle(Request $request, Place $place, ToggleBookmarkAction $action): JsonResponse
    {
        // TODO: Toggle saved status for place
    }
}
