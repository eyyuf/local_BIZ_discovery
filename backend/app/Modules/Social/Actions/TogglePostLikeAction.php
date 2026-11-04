<?php

namespace App\Modules\Social\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Social\Models\Post;

class TogglePostLikeAction
{
    public function execute(User $user, Post $post): bool
    {
        // TODO: Toggle like status for user on post
    }
}
