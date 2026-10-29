<?php

namespace App\Modules\Discovery\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Discovery\Actions\GetNearbyPlacesAction;
use App\Modules\Discovery\Actions\SearchPlacesAction;
use App\Modules\Discovery\Requests\NearbyPlacesRequest;
use App\Modules\Discovery\Requests\SearchPlacesRequest;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    public function search(SearchPlacesRequest $request, SearchPlacesAction $action): JsonResponse
    {
        // TODO: Call action and return formatted SearchResultResource collection
    }

    public function nearby(NearbyPlacesRequest $request, GetNearbyPlacesAction $action): JsonResponse
    {
        // TODO: Call action and return nearby places for map pins
    }
}
