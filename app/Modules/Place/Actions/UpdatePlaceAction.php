<?php

namespace App\Modules\Place\Actions;

use App\Modules\Place\Models\Place;
use Illuminate\Support\Str;

class UpdatePlaceAction
{
    public function execute(Place $place, array $data): Place
    {
        if (isset($data['name']) && $data['name'] !== $place->name) {
            $data['slug'] = Str::slug($data['name']) . '-' . Str::lower(Str::random(8));
        }

        $place->update($data);

        return $place;
    }
}
