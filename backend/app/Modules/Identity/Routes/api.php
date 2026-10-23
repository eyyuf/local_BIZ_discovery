<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Identity\Controllers\AuthController;
use App\Modules\Identity\Controllers\ProfileController; 
Route::middleware('api')->prefix('api/v1/auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);


    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
    Route::get('reset-password/{token}', function ($token) {
        return response()->json(['token' => $token]);
    })->name('password.reset');

    Route::get('google/redirect', [AuthController::class, 'redirectToGoogle']);
    Route::get('google/callback', [AuthController::class, 'handleGoogleCallback']);

    // Verification notice route for unverified users
    Route::get('email/verify', function () {
        return response()->json([
            'message' => 'Your email address is not verified.',
        ], 403);
    })->name('verification.notice');

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

