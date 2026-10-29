<?php

namespace App\Modules\Place\Policies;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\MenuItem;

class MenuItemPolicy
{
    public function update(User $user, MenuItem $menuItem): bool
    {
       return $user->id === $menuItem->section->place->user_id;
    }
    public function delete(User $user, MenuItem $menuItem): bool
    {
        return $user->id === $menuItem->section->place->user_id;
    }
}
