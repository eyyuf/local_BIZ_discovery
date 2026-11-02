<?php

namespace App\Modules\Discovery\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Discovery\Actions\GetExploreFeedAction;
use App\Modules\Discovery\Requests\ExploreRequest;
use App\Modules\Discovery\Resources\ExploreSectionResource;
use Illuminate\Http\JsonResponse;

class ExploreController extends Controller
{
    /**
     * Return curated explore sections.
     */
    public function index(ExploreRequest $request, GetExploreFeedAction $action): JsonResponse
    {
        $lat = $request->filled('lat') ? (float) $request->validated('lat') : null;
        $lng = $request->filled('lng') ? (float) $request->validated('lng') : null;

        $sections = $action->execute($lat, $lng);

        return ExploreSectionResource::collection($sections)->response();
    }
}
