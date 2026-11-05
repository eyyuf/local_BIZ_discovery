<?php

namespace App\Modules\Social\Services;

use App\Modules\Social\Contracts\SocialPostInterface;
use App\Modules\Social\Models\Post;

class SocialPostService implements SocialPostInterface
{
    public function getPlaceActiveDealsCount(int $placeId): int
    {
        return Post::where('place_id', $placeId)
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->count();
    }

    public function isPostActive(int $postId): bool
    {
        return Post::where('id', $postId)
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->exists();
    }
}

