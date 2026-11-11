<?php

namespace App\Modules\Review\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;

class RemoveFavoriteAction
{
    /**
     * Remove a place from the user's favorites.
     *
     * @param User $user
     * @param Place $place
     * @return bool
     */
    public function execute(User $user, Place $place): bool
    {
        $user->favorites()->where('place_id', $place->id)->delete();

        return true;
    }
}
