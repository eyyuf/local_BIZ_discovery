<?php

namespace App\Modules\Place\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Place\Actions\CreateMenuItemAction;
use App\Modules\Place\Actions\CreateMenuSectionAction;
use App\Modules\Place\Actions\GetPlaceMenuAction;
use App\Modules\Place\Actions\UpdateMenuItemAction;
use App\Modules\Place\Models\MenuItem;
use App\Modules\Place\Models\MenuSection;
use App\Modules\Place\Models\Place;
use App\Modules\Place\Requests\StoreMenuItemRequest;
use App\Modules\Place\Requests\StoreMenuSectionRequest;
use App\Modules\Place\Requests\UpdateMenuItemRequest;
use App\Modules\Place\Resources\MenuItemResource;
use App\Modules\Place\Resources\MenuSectionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class MenuController extends Controller
{
    public function index(Place $place, GetPlaceMenuAction $action): JsonResponse
    {
        $menuSections = $action->execute($place);

        return response()->json([
            'message' => 'menu items retrived sucessfully',
            'data'    => MenuSectionResource::collection($menuSections),
        ]);
    }

    public function storeSection(StoreMenuSectionRequest $request, Place $place, CreateMenuSectionAction $action): JsonResponse
    {
        Gate::authorize('update', $place);

        $section = $action->execute($place, $request->validated());

        return response()->json([
            'message' => 'menu section created successfully',
            'data'    => new MenuSectionResource($section),
        ], 201);
    }

    public function storeItem(StoreMenuItemRequest $request, Place $place, CreateMenuItemAction $action): JsonResponse
    {
        Gate::authorize('update', $place);

        $item = $action->execute($place, $request->validated());

        return response()->json([
            'message' => 'menu item created successfully',
            'data'    => new MenuItemResource($item),
        ], 201);
    }

    public function updateItem(UpdateMenuItemRequest $request, MenuItem $menuItem, UpdateMenuItemAction $action): JsonResponse
    {
        Gate::authorize('update', $menuItem);

        $item = $action->execute($menuItem, $request->validated());

        return response()->json([
            'message' => 'menu item updated successfully',
            'data'    => new MenuItemResource($item),
        ], 200);
    }

    public function destroyItem(MenuItem $menuItem): JsonResponse
    {
        Gate::authorize('delete', $menuItem);

        $menuItem->delete();

        return response()->json([
            'message' => 'menu item deleted successfully',
        ], 200);
    }
}
