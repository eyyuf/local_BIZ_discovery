<?php

namespace App\Modules\Place\Actions;

use App\Modules\Place\Models\Place;

class GetPlaceMenuAction
{
    /**
     * Create a new class instance.
     */
    public function execute(Place $place)
    {
        return $place->menuSections()->with('items')->get();
    }
}
