<?php

namespace App\Modules\Discovery\Policies;

use App\Modules\Discovery\Models\PlaceBookmark;
use App\Modules\Identity\Models\User;

class BookmarkPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function delete(User $user, PlaceBookmark $bookmark): bool
    {
        return $user->id === $bookmark->user_id;
    }
}
