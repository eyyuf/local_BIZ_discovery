<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Identity\Controllers\AuthController;
use App\Modules\Identity\Controllers\ProfileController; 
Route::prefix('api/v1/auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);


    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);

    Route::get('google/redirect', [AuthController::class, 'redirectToGoogle']);
    Route::get('google/callback', [AuthController::class, 'handleGoogleCallback']);

    // Email verification link clicked from email (signed)
    Route::get('email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware(['signed'])
        ->name('verification.verify');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']); 
        Route::get('me', [ProfileController::class, 'me']);
        Route::match(['put', 'post'], 'profile', [ProfileController::class, 'update']);

        // Resend email verification notification
        Route::post('email/verification-notification', [AuthController::class, 'resendVerificationEmail'])
            ->middleware('throttle:6,1');
    });
});

