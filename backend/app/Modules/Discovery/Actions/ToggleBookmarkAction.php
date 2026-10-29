<?php

namespace App\Modules\Discovery\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;

class ToggleBookmarkAction
{
    public function execute(User $user, Place $place): bool
    {
        // TODO: Implement toggle bookmark (save/unsave place for user)
    }
}
