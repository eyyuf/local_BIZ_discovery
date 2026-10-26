<?php

namespace App\Modules\Place\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Place\Models\Place;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlaceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = Place::where('is_active', true)->paginate(10);
        return response()->json([
            'message'=>'retrieved succesfully',
            'data'=>$data,
        ],200);
    }

    public function show(Place $place): JsonResponse
    {
        if($place->is_active == false){
            abort(404, 'place not found');

        }
        $place->load(['operatingHours', 'menuSections.items']);
        return response()->json([
            'message'=>'retrieved succesfully',
            'data'=>$place,
        ],200);
    }
}
