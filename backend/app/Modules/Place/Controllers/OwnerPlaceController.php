<?php

namespace App\Modules\Place\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Place\Actions\CreatePlaceAction;
use App\Modules\Place\Actions\UpdatePlaceAction;
use App\Modules\Place\Models\Place;
use App\Modules\Place\Requests\StorePlaceRequest;
use App\Modules\Place\Requests\UpdatePlaceRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OwnerPlaceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // TODO: List places owned by the authenticated user
    }

    public function store(StorePlaceRequest $request, CreatePlaceAction $action): JsonResponse
    {
        // TODO: Store new place for owner
    }

    public function update(UpdatePlaceRequest $request, Place $place, UpdatePlaceAction $action): JsonResponse
    {
        // TODO: Update place details
    }

    public function destroy(Place $place): JsonResponse
    {
        // TODO: Delete place
    }
}
