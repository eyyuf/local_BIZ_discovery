<?php

namespace App\Modules\Review\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Place\Models\Place;
use App\Modules\Review\Actions\ToggleFavoriteAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // TODO: Return paginated user favorites with place relation
    }

    public function toggle(Request $request, Place $place, ToggleFavoriteAction $action): JsonResponse
    {
        // TODO: Toggle place favorite for authenticated user
    }
}
