<?php

namespace App\Modules\Discovery\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Discovery\Actions\GetNearbyPlacesAction;
use App\Modules\Discovery\Actions\SearchPlacesAction;
use App\Modules\Discovery\Requests\NearbyPlacesRequest;
use App\Modules\Discovery\Requests\SearchPlacesRequest;
use App\Modules\Discovery\Resources\SearchResultResource;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    /**
     * Search places using multiple filters (keywords, category, location radius, open now, sorting).
     *
     * @param SearchPlacesRequest $request
     * @param SearchPlacesAction $action
     * @return JsonResponse
     */
    public function search(SearchPlacesRequest $request, SearchPlacesAction $action): JsonResponse
    {
        $results = $action->execute($request->validated());

        return SearchResultResource::collection($results)
            ->additional(['message' => 'retrieved successfully'])
            ->response();
    }

    public function nearby(NearbyPlacesRequest $request, GetNearbyPlacesAction $action): JsonResponse
    {
        // TODO: Call action and return nearby places for map pins
    }
}
