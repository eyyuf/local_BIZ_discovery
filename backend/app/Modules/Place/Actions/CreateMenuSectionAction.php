<?php

namespace App\Modules\Place\Actions;

use App\Modules\Place\Models\MenuSection;
use App\Modules\Place\Models\Place;

class CreateMenuSectionAction
{
    public function execute(Place $place, array $data): MenuSection
    {
        $displayOrder = $data['display_order'] 
            ?? (($place->menuSections()->max('display_order') ?? -1) + 1);

        return $place->menuSections()->create([
            'name'          => $data['name'],
            'display_order' => $displayOrder,
        ]);
    }
}
