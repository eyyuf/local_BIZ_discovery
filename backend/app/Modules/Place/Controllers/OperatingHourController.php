<?php

namespace App\Modules\Place\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Place\Actions\UpdateOperatingHoursAction;
use App\Modules\Place\Models\Place;
use App\Modules\Place\Requests\UpdateHoursRequest;
use Illuminate\Http\JsonResponse;

class OperatingHourController extends Controller
{
    public function update(UpdateHoursRequest $request, Place $place, UpdateOperatingHoursAction $action): JsonResponse
    {
        // TODO: Update place operating hours
    }
}
