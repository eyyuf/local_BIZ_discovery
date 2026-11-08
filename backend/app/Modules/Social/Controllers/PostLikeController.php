<?php

namespace App\Modules\Social\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Social\Actions\TogglePostLikeAction;
use App\Modules\Social\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostLikeController extends Controller
{
    public function toggle(Request $request, Post $post, TogglePostLikeAction $action): JsonResponse
    {
        $result = $action->execute($post, $request->user());

        return response()->json([
            'message'     => $result['liked'] ? 'Post liked successfully' : 'Post unliked successfully',
            'liked'       => $result['liked'],
            'likes_count' => $result['likes_count'],
        ], 200);
    }
}
