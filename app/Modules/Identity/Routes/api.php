<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Identity\Controllers\AuthController;
use App\Modules\Identity\Controllers\ProfileController; 
Route::prefix('api/v1/auth')->group(function () {

    Route::get('google/redirect', [AuthController::class, 'redirectToGoogle']);
    Route::get('google/callback', [AuthController::class, 'handleGoogleCallback']);

  
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']); 
        Route::get('me', [ProfileController::class, 'me']);
        Route::match(['put', 'post'], 'profile', [ProfileController::class, 'update']);
    });
});

