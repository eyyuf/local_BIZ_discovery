<?php

namespace App\Modules\Review\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use App\Modules\Review\Models\Favorite;

class AddFavoriteAction
{
    /**
     * Add a place to the user's favorites.
     *
     * @param User $user
     * @param Place $place
     * @return Favorite
     */
    public function execute(User $user, Place $place): Favorite
    {
        if (! $place->is_active) {
            abort(404, 'Place not found.');
        }

        return $user->favorites()->firstOrCreate([
            'place_id' => $place->id,
        ]);
    }
}
