<?php

namespace App\Modules\Social\Policies;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use App\Modules\Social\Models\Post;

class PostPolicy
{
    public function create(User $user, Place $place): bool
    {
        // TODO: Authorize post creation for place owner
    }

    public function delete(User $user, Post $post): bool
    {
        // TODO: Authorize post deletion
    }
}
