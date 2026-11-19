<?php

namespace App\Modules\Review\Policies;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;

class PlaceRatingPolicy
{
    /**
     * Determine whether the user can rate the place.
     * Business rules:
     * - Place must be active.
     * - Place owner cannot rate their own place.
     */
    public function rate(User $user, Place $place): bool
    {
        if (! $place->is_active) {
            return false;
        }

        if ((int) $user->id === (int) $place->user_id) {
            return false;
        }

        return true;
    }
}
