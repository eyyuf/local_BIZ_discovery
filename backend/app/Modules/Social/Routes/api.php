<?php

use App\Modules\Social\Controllers\DealFeedController;
use App\Modules\Social\Controllers\OwnerPostController;
use App\Modules\Social\Controllers\PostLikeController;
use Illuminate\Support\Facades\Route;

// Public social & deals routes
Route::prefix('api/v1/social')->middleware('api')->group(function () {
    Route::get('deals', [DealFeedController::class, 'index']);
    Route::get('places/{place}/deals', [DealFeedController::class, 'placeDeals']);
});

// Authenticated social routes (publish posts, delete posts, like posts)
Route::prefix('api/v1/social')->middleware(['api', 'auth:sanctum'])->group(function () {
    Route::post('places/{place}/posts', [OwnerPostController::class, 'store']);
    Route::delete('posts/{post}', [OwnerPostController::class, 'destroy']);
    Route::post('posts/{post}/like', [PostLikeController::class, 'toggle']);
});

