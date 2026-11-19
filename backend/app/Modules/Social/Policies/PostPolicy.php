<?php

namespace App\Modules\Social\Policies;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use App\Modules\Social\Models\Post;

class PostPolicy
{
    /**
     * Determine whether the user can create a post for the specified place.
     * Only the registered owner of the place is authorized.
     */
    public function create(User $user, Place $place): bool
    {
        return (int) $user->id === (int) $place->user_id;
    }

    /**
     * Determine whether the user can update the post.
     * Either the post author or the place owner.
     */
    public function update(User $user, Post $post): bool
    {
        return (int) $user->id === (int) $post->user_id
            || (int) $user->id === (int) $post->place?->user_id;
    }

    /**
     * Determine whether the user can delete the post.
     * Either the post author or the place owner.
     */
    public function delete(User $user, Post $post): bool
    {
        return (int) $user->id === (int) $post->user_id
            || (int) $user->id === (int) $post->place?->user_id;
    }
}
