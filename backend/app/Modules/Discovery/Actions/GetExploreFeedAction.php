<?php

namespace App\Modules\Discovery\Actions;

use Illuminate\Support\Collection;

class GetExploreFeedAction
{
    public function execute(?float $lat = null, ?float $lng = null): array
    {
        // TODO: Implement curated explore feed (Trending, Top Rated, New Places)
    }
}
