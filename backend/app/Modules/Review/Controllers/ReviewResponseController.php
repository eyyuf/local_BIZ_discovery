<?php

namespace App\Modules\Review\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Review\Models\Review;
use App\Modules\Review\Models\ReviewResponse;
use App\Modules\Review\Requests\StoreResponseRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewResponseController extends Controller
{
    public function store(StoreResponseRequest $request, Review $review): JsonResponse
    {
        // TODO: Authorize business owner and store review response
    }

    public function destroy(Request $request, ReviewResponse $response): JsonResponse
    {
        // TODO: Authorize business owner and delete review response
    }
}
