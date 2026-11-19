<?php

namespace App\Modules\Review\Actions;

use App\Modules\Identity\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class ListFavoritesAction
{
    /**
     * Retrieve a paginated listing of the user's favorites with places.
     *
     * @param User $user
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function execute(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return $user->favorites()
            ->with('place')
            ->latest()
            ->paginate($perPage);
    }
}
