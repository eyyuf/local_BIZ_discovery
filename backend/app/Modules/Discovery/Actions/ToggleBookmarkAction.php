<?php

namespace App\Modules\Discovery\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use App\Modules\Discovery\Models\PlaceBookmark;

class ToggleBookmarkAction
{
    public function execute(User $user, Place $place): bool
    {
        $bookmark = PlaceBookmark::where('user_id', $user->id)
                        ->where('place_id', $place->id)->first();

        if ($bookmark) {
            $bookmark->delete();
            return false;
        } 
        PlaceBookmark::create([
            'user_id'=>$user->id,
            'place_id'=>$place->id,
        ]);
        return true;
    }
}
