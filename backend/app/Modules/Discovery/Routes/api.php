<?php

use App\Modules\Discovery\Controllers\BookmarkController;
use App\Modules\Discovery\Controllers\CategoryController;
use App\Modules\Discovery\Controllers\ExploreController;
use App\Modules\Discovery\Controllers\SearchController;
use App\Modules\Discovery\Controllers\SuggestionController;
use Illuminate\Support\Facades\Route;

// Public discovery routes
Route::prefix('api/v1/discovery')->group(function () {
    Route::get('search', [SearchController::class, 'search']);
    Route::get('nearby', [SearchController::class, 'nearby']);
    Route::get('explore', [ExploreController::class, 'index']);
    Route::get('suggestions', [SuggestionController::class, 'index']);
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/{category:slug}', [CategoryController::class, 'show']);
});

// Authenticated user discovery routes (bookmarks/saved places)
Route::prefix('api/v1/discovery')->middleware('auth:sanctum')->group(function () {
    Route::get('bookmarks', [BookmarkController::class, 'index']);
    Route::post('bookmarks/{place}', [BookmarkController::class, 'toggle']);
});
