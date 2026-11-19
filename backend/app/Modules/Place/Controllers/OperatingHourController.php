<?php

namespace App\Modules\Place\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Place\Actions\UpdateOperatingHoursAction;
use App\Modules\Place\Models\Place;
use App\Modules\Place\Requests\UpdateHoursRequest;
use App\Modules\Place\Resources\OperatingHourResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class OperatingHourController extends Controller
{
    public function update(UpdateHoursRequest $request, Place $place, UpdateOperatingHoursAction $action): JsonResponse
    {
        Gate::authorize('update', $place);

        $hours = $action->execute($place, $request->validated('hours'));

        return response()->json([
            'message' => 'operating hours updated successfully',
            'data'    => OperatingHourResource::collection($hours),
        ], 200);
    }
}
