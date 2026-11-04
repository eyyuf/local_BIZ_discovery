<?php

namespace App\Modules\Social\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Place\Models\Place;
use App\Modules\Social\Actions\PublishDealAction;
use App\Modules\Social\Models\Post;
use App\Modules\Social\Requests\StorePostRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OwnerPostController extends Controller
{
    public function store(StorePostRequest $request, Place $place, PublishDealAction $action): JsonResponse
    {
        // TODO: Authorize owner and publish post
    }

    public function destroy(Request $request, Post $post): JsonResponse
    {
        // TODO: Authorize owner and delete post
    }
}
