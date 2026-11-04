<?php

namespace App\Modules\Social\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Place\Models\Place;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DealFeedController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // TODO: Return paginated active deals & announcements feed
    }

    public function placeDeals(Place $place): JsonResponse
    {
        // TODO: Return active deals for a specific place
    }
}
