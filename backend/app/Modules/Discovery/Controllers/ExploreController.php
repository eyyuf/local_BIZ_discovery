<?php

namespace App\Modules\Discovery\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Discovery\Actions\GetExploreFeedAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExploreController extends Controller
{
    public function index(Request $request, GetExploreFeedAction $action): JsonResponse
    {
        // TODO: Return curated explore sections
    }
}
