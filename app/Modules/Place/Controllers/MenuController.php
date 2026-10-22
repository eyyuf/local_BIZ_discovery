<?php

namespace App\Modules\Place\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Place\Models\MenuItem;
use App\Modules\Place\Models\MenuSection;
use App\Modules\Place\Models\Place;
use App\Modules\Place\Requests\StoreMenuItemRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index(Place $place): JsonResponse
    {
        // TODO: Get menu sections and items for place
    }

    public function storeSection(Request $request, Place $place): JsonResponse
    {
        // TODO: Add menu section to place
    }

    public function storeItem(StoreMenuItemRequest $request, Place $place): JsonResponse
    {
        // TODO: Add menu item to section
    }

    public function updateItem(Request $request, MenuItem $menuItem): JsonResponse
    {
        // TODO: Update menu item
    }

    public function destroyItem(MenuItem $menuItem): JsonResponse
    {
        // TODO: Delete menu item
    }
}
