<?php

namespace App\Modules\Place\Policies;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;

class PlacePolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Place $place): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Place $place): bool
    {
        return $user->id===$place->user_id;
    }

    public function delete(User $user, Place $place): bool
    {
        return $user->id===$place->user_id;
    }
}
