<?php

namespace App\Modules\Discovery\Actions;

use Illuminate\Support\Collection;

class GetSearchSuggestionsAction
{
    public function execute(string $query, int $limit = 5): Collection
    {
        // TODO: Implement autocomplete suggestions for places and categories
    }
}
