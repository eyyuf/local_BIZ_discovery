<?php

namespace App\Modules\Social\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Place\Models\Place;
use App\Modules\Social\Actions\PublishDealAction;
use App\Modules\Social\DTOs\CreatePostDTO;
use App\Modules\Social\Models\Post;
use App\Modules\Social\Requests\StorePostRequest;
use App\Modules\Social\Resources\PostResource;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class OwnerPostController extends Controller
{
    public function store(StorePostRequest $request, Place $place, PublishDealAction $action): JsonResponse
    {
        Gate::authorize('create', [Post::class, $place]);

        $dto = new CreatePostDTO(
            title: (string) $request->validated('title'),
            content: (string) $request->validated('content'),
            dealType: (string) $request->validated('deal_type', 'deal'),
            discountPercentage: $request->validated('discount_percentage') !== null ? (float) $request->validated('discount_percentage') : null,
            discountCode: $request->validated('discount_code'),
            imageUrl: $request->validated('image_url'),
            maxClaims: $request->validated('max_claims') !== null ? (int) $request->validated('max_claims') : null,
            expiresAt: $request->validated('expires_at') ? Carbon::parse($request->validated('expires_at')) : null,
        );

        $post = $action->execute($place, $request->user(), $dto);

        return response()->json([
            'message' => 'Post published successfully',
            'data'    => new PostResource($post),
        ], 201);
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
