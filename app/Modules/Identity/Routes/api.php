<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Identity\Controllers\AuthController;
Route::prefix('api/v1/auth')->group(function () {
    Route::get('google/redirect', [AuthController::class, 'redirectToGoogle']);
    Route::get('google/callback', [AuthController::class, 'handleGoogleCallback']);
});

