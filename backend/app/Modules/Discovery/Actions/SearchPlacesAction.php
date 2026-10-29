<?php

namespace App\Modules\Discovery\Actions;

use App\Modules\Place\Models\Place;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SearchPlacesAction
{
    public function execute(array $filters): LengthAwarePaginator
    {
        // TODO: Implement PostGIS search, radius, category, keyword, and open_now filtering
    }
}
