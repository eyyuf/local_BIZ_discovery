<?php

use App\Modules\Place\Controllers\MenuController;
use App\Modules\Place\Controllers\OperatingHourController;
use App\Modules\Place\Controllers\OwnerPlaceController;
use App\Modules\Place\Controllers\PlaceController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::prefix('api/v1/places')->group(function () {
    Route::get('/', [PlaceController::class, 'index']);
    Route::get('{place:slug}', [PlaceController::class, 'show']);
    Route::get('{place}/menu', [MenuController::class, 'index']);
});

// Business Owner routes (Protected by auth)
Route::prefix('api/v1/owner/places')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [OwnerPlaceController::class, 'index']);
    Route::post('/', [OwnerPlaceController::class, 'store']);
    Route::put('{place}', [OwnerPlaceController::class, 'update']);
    Route::delete('{place}', [OwnerPlaceController::class, 'destroy']);

    // Operating hours
    Route::put('{place}/operating-hours', [OperatingHourController::class, 'update']);

    // Menu Management
    Route::post('{place}/menu/sections', [MenuController::class, 'storeSection']);
    Route::post('{place}/menu/items', [MenuController::class, 'storeItem']);
    Route::put('menu/items/{menuItem}', [MenuController::class, 'updateItem']);
    Route::delete('menu/items/{menuItem}', [MenuController::class, 'destroyItem']);
});
