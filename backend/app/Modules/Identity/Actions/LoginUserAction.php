<?php

namespace App\Modules\Identity\Actions;

use App\Modules\Identity\DTOs\LoginDTO;
use App\Modules\Identity\Models\User;
use App\Modules\Identity\Notifications\AccountLockedRescueNotification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginUserAction
{
    public function execute(LoginDTO|array $data): User
    {
        $dto = $data instanceof LoginDTO ? $data : LoginDTO::fromArray($data);

        $throttleKey = Str::transliterate(Str::lower($dto->email) . '|' . request()->ip());

        $user = User::where('email', $dto->email)->first();

        if ($user && $user->locked_at !== null) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been locked due to multiple failed login attempts. Please check your email for the unlock link or reset your password.'],
            ])->status(423);
        }

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'email' => [__('auth.throttle', [
                    'seconds' => $seconds,
                    'minutes' => ceil($seconds / 60),
                ])],
            ])->status(429);
        }

        if (! $user || ! Hash::check($dto->password, $user->password)) {
            RateLimiter::hit($throttleKey, 86400);

            $attempts = RateLimiter::attempts($throttleKey);

            if ($attempts >= 5) {
                if ($user) {
                    $user->update(['locked_at' => now()]);
                    $user->notify(new AccountLockedRescueNotification());
                }

                throw ValidationException::withMessages([
                    'email' => ['Your account has been locked after 5 failed attempts. We have sent an email with a secure link to unlock and log in.'],
                ])->status(423);
            }

            $remaining = 5 - $attempts;
            throw ValidationException::withMessages([
                'email' => ["Invalid credentials. You have {$remaining} attempt(s) remaining."],
            ]);
        }

        if ($user->role === 'owner' && ! $user->hasVerifiedEmail()) {
            throw ValidationException::withMessages([
                'email' => ['Please verify your business owner email address before logging in.'],
            ]);
        }

        RateLimiter::clear($throttleKey);

        if ($user->locked_at !== null) {
            $user->update(['locked_at' => null]);
        }

        return $user;
    }
}
