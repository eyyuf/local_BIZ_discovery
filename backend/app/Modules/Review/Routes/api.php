<?php

use App\Modules\Review\Controllers\FavoriteController;
use App\Modules\Review\Controllers\PlaceRatingController;
use App\Modules\Review\Controllers\ReviewController;
use App\Modules\Review\Controllers\ReviewMessageController;
use Illuminate\Support\Facades\Route;

// Public review, rating, and discussion browsing routes
Route::prefix('api/v1')->middleware('api')->group(function () {
    Route::get('places/{place}/reviews', [ReviewController::class, 'index']);
    Route::get('reviews/{review}', [ReviewController::class, 'show']);
    Route::get('places/{place}/rating', [PlaceRatingController::class, 'show']);
    Route::get('reviews/{review}/messages', [ReviewMessageController::class, 'index']);
});

// Authenticated review, rating, discussion message, and favorite routes
Route::prefix('api/v1')->middleware(['api', 'auth:sanctum'])->group(function () {
    // Written reviews
    Route::get('user/reviews', [ReviewController::class, 'userReviews']);
    Route::post('places/{place}/reviews', [ReviewController::class, 'store']);
    Route::match(['put', 'patch'], 'reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('reviews/{review}', [ReviewController::class, 'destroy']);

    // Place ratings
    Route::match(['post', 'put'], 'places/{place}/rating', [PlaceRatingController::class, 'store']);

    // Public review discussion messages
    Route::post('reviews/{review}/messages', [ReviewMessageController::class, 'store']);
    Route::match(['put', 'patch'], 'reviews/{review}/messages/{message}', [ReviewMessageController::class, 'update']);
    Route::delete('reviews/{review}/messages/{message}', [ReviewMessageController::class, 'destroy']);

    // Place favorites
    Route::get('favorites', [FavoriteController::class, 'index']);
    Route::post('places/{place}/favorite', [FavoriteController::class, 'store']);
    Route::delete('places/{place}/favorite', [FavoriteController::class, 'destroy']);
});
