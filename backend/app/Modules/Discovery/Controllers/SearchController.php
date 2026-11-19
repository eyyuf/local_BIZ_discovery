<?php

namespace App\Modules\Discovery\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Discovery\Actions\GetNearbyPlacesAction;
use App\Modules\Discovery\Actions\SearchPlacesAction;
use App\Modules\Discovery\DTOs\NearbySearchDTO;
use App\Modules\Discovery\DTOs\SearchFilterDTO;
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
        $dto = SearchFilterDTO::fromRequest($request);
        $results = $action->execute($dto);

        return SearchResultResource::collection($results)
            ->additional(['message' => 'retrieved successfully'])
            ->response();
    }

    public function nearby(NearbyPlacesRequest $request, GetNearbyPlacesAction $action): JsonResponse
    {
        $dto = NearbySearchDTO::fromRequest($request);

        $places = $action->execute(
            lat: $dto->lat,
            lng: $dto->lng,
            radiusKm: $dto->radiusKm,
            limit: $dto->limit,
        );

        return SearchResultResource::collection($places)->response();
    }
}
