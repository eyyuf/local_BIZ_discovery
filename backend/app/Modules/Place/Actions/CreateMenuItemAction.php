<?php

namespace App\Modules\Place\Actions;

use App\Modules\Place\Models\MenuItem;
use App\Modules\Place\Models\Place;

class CreateMenuItemAction
{
    public function execute(Place $place, array $data): MenuItem
    {
        $section = $place->menuSections()->findOrFail($data['menu_section_id']);

        return $section->items()->create([
            'name'         => $data['name'],
            'description'  => $data['description'] ?? null,
            'price'        => $data['price'],
            'image_url'    => $data['image_url'] ?? null,
            'is_available' => $data['is_available'] ?? true,
        ]);
    }
}
