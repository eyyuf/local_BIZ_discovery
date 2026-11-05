<?php

namespace App\Modules\Social\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Social\Models\Post;

class TogglePostLikeAction
{
    /**
     * Execute toggle post like logic.
     */
    public function execute(Post $post, User $user): array
    {
        // TODO: Toggle like status for user on post
    }
}
