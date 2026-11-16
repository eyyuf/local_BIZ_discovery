<?php

namespace App\Modules\Place\Controllers;
use Illuminate\Support\Facades\Gate;

use App\Http\Controllers\Controller;
use App\Modules\Place\Actions\CreatePlaceAction;
use App\Modules\Place\Actions\UpdatePlaceAction;
use App\Modules\Place\DTOs\CreatePlaceDTO;
use App\Modules\Place\DTOs\UpdatePlaceDTO;
use App\Modules\Place\Models\Place;
use App\Modules\Place\Requests\StorePlaceRequest;
use App\Modules\Place\Requests\UpdatePlaceRequest;
use App\Modules\Review\Contracts\ReviewQueryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class OwnerPlaceController extends Controller
{
    public function index(Request $request, ReviewQueryInterface $reviewQuery): JsonResponse
    {
        $data = $request->user()->places()->paginate(10);
        $reviewQuery->attachRatingSummaries($data);

        return response()->json([
            'message'=>'retrieved succesfully',
            'data'=>$data,
        ],200);
    }

    public function store(StorePlaceRequest $request, CreatePlaceAction $action): JsonResponse
    {
        $place = $action->execute($request->user(), CreatePlaceDTO::fromRequest($request));
        return response()->json([
            'message'=>'stored susccusfully',
            'data'=>$place,
        ],201);
    }

    public function update(UpdatePlaceRequest $request, Place $place, UpdatePlaceAction $action): JsonResponse
    {
        Gate::authorize('update',$place);
        $place=$action->execute($place, UpdatePlaceDTO::fromRequest($request));
        Cache::forget("place_{$place->id}");
        return response()->json([
            'message'=>'updated susccusfully',
            'data'=>$place,
        ],200);
    }

    public function destroy(Place $place): JsonResponse
    {
        Gate::authorize('delete', $place);
        $place->delete();
        return response()->json([
            'message'=>'deleted susccusfully',
        ],204);
    }
}
