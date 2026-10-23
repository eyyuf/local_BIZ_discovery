<?php

use App\Modules\Place\Controllers\MenuController;
use App\Modules\Place\Controllers\OperatingHourController;
use App\Modules\Place\Controllers\OwnerPlaceController;
use App\Modules\Place\Controllers\PlaceController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::middleware('api')->prefix('api/v1/places')->group(function () {
    Route::get('/', [PlaceController::class, 'index']);
    Route::get('{place:slug}', [PlaceController::class, 'show']);
    Route::get('{place}/menu', [MenuController::class, 'index']);
});

// Business Owner routes (Protected by auth)
Route::middleware(['api', 'auth:sanctum'])->prefix('api/v1/owner/places')->group(function () {
    // Authenticated read-only operation (accessible to unverified users)
    Route::get('/', [OwnerPlaceController::class, 'index']);

    // Sensitive business operations (require verified email)
    Route::middleware('verified')->group(function () {
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
});
