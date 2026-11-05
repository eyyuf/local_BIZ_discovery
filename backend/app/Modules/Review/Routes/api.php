<?php

use App\Modules\Review\Controllers\FavoriteController;
use App\Modules\Review\Controllers\ReviewController;
use App\Modules\Review\Controllers\ReviewResponseController;
use Illuminate\Support\Facades\Route;

// Public review browsing
Route::prefix('api/v1/places/{place}/reviews')->group(function () {
    Route::get('/', [ReviewController::class, 'index']);
});

// Authenticated user reviews, owner responses, and favorites
Route::prefix('api/v1')->middleware('auth:sanctum')->group(function () {
    Route::post('places/{place}/reviews', [ReviewController::class, 'store']);
    Route::delete('reviews/{review}', [ReviewController::class, 'destroy']);

    // Place owner responses
    Route::post('reviews/{review}/responses', [ReviewResponseController::class, 'store']);
    Route::delete('reviews/responses/{response}', [ReviewResponseController::class, 'destroy']);

    // Place favorites
    Route::get('favorites', [FavoriteController::class, 'index']);
    Route::post('places/{place}/favorite', [FavoriteController::class, 'toggle']);
});
