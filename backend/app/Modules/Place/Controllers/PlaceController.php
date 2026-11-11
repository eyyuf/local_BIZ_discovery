<?php

namespace App\Modules\Place\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Place\Models\Place;
use App\Modules\Review\Contracts\ReviewQueryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class PlaceController extends Controller
{
    public function index(ReviewQueryInterface $reviewQuery): JsonResponse
    {
        $data = Place::where('is_active', true)->paginate(10);
        $reviewQuery->attachRatingSummaries($data);

        return response()->json([
            'message' => 'retrieved succesfully',
            'data'    => $data,
        ], 200);
    }

    public function show(Place $place, ReviewQueryInterface $reviewQuery): JsonResponse
    {
        if ($place->is_active == false) {
            abort(404, 'place not found');
        }

        $data = Cache::remember("place_{$place->id}", 3600, function () use ($place, $reviewQuery) {
            $place->load(['operatingHours', 'menuSections.items']);
            $reviewQuery->attachRatingSummaries($place);

            return $place;
        });

        return response()->json([
            'message' => 'retrieved succesfully',
            'data'    => $data,
        ], 200);
    }
}
