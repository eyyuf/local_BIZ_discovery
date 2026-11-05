<?php

namespace App\Modules\Social\Actions;

use App\Modules\Social\Models\DealClaim;
use App\Modules\Social\Models\Post;

class ExpireOutdatedPostsAction
{
    public function execute(): int
    {
        $now = now();

        $expiredPostsCount = Post::where('is_active', true)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', $now)
            ->update(['is_active' => false]);

        DealClaim::where('status', 'claimed')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', $now)
            ->update(['status' => 'expired']);

        return $expiredPostsCount;
    }
}
