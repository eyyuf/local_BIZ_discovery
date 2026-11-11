<?php

namespace App\Modules\Place\Actions;

use App\Modules\Place\Models\MenuItem;

class UpdateMenuItemAction
{
    public function execute(MenuItem $menuItem, array $data): MenuItem
    {
        $menuItem->update($data);

        return $menuItem;
    }
}
