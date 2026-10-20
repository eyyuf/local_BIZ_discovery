<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Identity\Controllers\AuthController;
use App\Modules\Identity\Controllers\ProfileController; 
Route::prefix('api/v1/auth')->group(function(){
    Route::get('google/redirect',[AuthController::class, 'redirectToGoogle']);
    Route::get('google/callback', [AuthController::class, 'handleGoogleCallback']);
});
Route::middleware('auth:sanctum')->prefix('api/v1')->group(function () {
    Route::get('auth/me', [ProfileController::class, 'me']);
});
