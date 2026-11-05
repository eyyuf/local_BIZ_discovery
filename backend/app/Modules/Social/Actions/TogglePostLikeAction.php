<?php

namespace App\Modules\Social\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Social\Models\Post;
use App\Modules\Social\Models\PostLike;
use Illuminate\Support\Facades\DB;

class TogglePostLikeAction
{
    public function execute(Post $post, User $user): array
    {
        return DB::transaction(function () use ($post, $user) {
            $existingLike = PostLike::where('post_id', $post->id)
                ->where('user_id', $user->id)
                ->first();

            if ($existingLike) {
                $existingLike->delete();
                $post->decrement('likes_count');
                $liked = false;
            } else {
                PostLike::create([
                    'post_id' => $post->id,
                    'user_id' => $user->id,
                ]);
                $post->increment('likes_count');
                $liked = true;
            }

            return [
                'liked'       => $liked,
                'likes_count' => (int) $post->fresh()->likes_count,
            ];
        });
    }
}
