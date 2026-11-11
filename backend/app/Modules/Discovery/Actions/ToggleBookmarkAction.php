<?php

namespace App\Modules\Discovery\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use App\Modules\Discovery\Models\PlaceBookmark;

class ToggleBookmarkAction
{
    /**
     * Toggle the bookmark status of a place for a user.
     *
     * @param User $user
     * @param Place $place
     * @return bool True if saved, false if unsaved.
     */
    public function execute(User $user, Place $place): bool
    {
        $bookmark = PlaceBookmark::where('user_id', $user->id)
            ->where('place_id', $place->id)
            ->first();

        if ($bookmark) {
            $bookmark->delete();
            return false;
        }

        PlaceBookmark::create([
            'user_id'  => $user->id,
            'place_id' => $place->id,
        ]);

        return true;
    }
}
