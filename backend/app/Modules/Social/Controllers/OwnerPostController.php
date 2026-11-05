<?php

namespace App\Modules\Social\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Place\Models\Place;
use App\Modules\Social\Actions\PublishDealAction;
use App\Modules\Social\DTOs\CreatePostDTO;
use App\Modules\Social\Models\Post;
use App\Modules\Social\Requests\StorePostRequest;
use App\Modules\Social\Resources\PostResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class OwnerPostController extends Controller
{
    public function store(StorePostRequest $request, Place $place, PublishDealAction $action): JsonResponse
    {
        Gate::authorize('create', [Post::class, $place]);

        $dto = CreatePostDTO::fromRequest($request);
        $post = $action->execute($place, $request->user(), $dto);

        return (new PostResource($post))
            ->additional(['message' => 'Post published successfully'])
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(Request $request, Post $post): JsonResponse
    {
        Gate::authorize('delete', $post);

        $post->delete();

        return response()->json([
            'message' => 'Post deleted successfully',
        ], 200);
    }
}
