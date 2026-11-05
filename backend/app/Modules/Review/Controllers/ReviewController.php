<?php

namespace App\Modules\Review\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Place\Models\Place;
use App\Modules\Review\Actions\CreateReviewAction;
use App\Modules\Review\Actions\DeleteReviewAction;
use App\Modules\Review\Models\Review;
use App\Modules\Review\Requests\StoreReviewRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request, Place $place): JsonResponse
    {
        // TODO: Return paginated published reviews with author and responses
    }

    public function store(StoreReviewRequest $request, Place $place, CreateReviewAction $action): JsonResponse
    {
        // TODO: Authorize user and create review
    }

    public function destroy(Request $request, Review $review, DeleteReviewAction $action): JsonResponse
    {
        // TODO: Authorize user and delete review
    }
}
