<?php

namespace App\Modules\Identity\Actions;

use App\Modules\Identity\DTOs\LoginDTO;
use App\Modules\Identity\Models\User;
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

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'email' => [__('auth.throttle', [
                    'seconds' => $seconds,
                    'minutes' => ceil($seconds / 60),
                ])],
            ])->status(429);
        }

        $user = User::where('email', $dto->email)->first();

        if (! $user || ! Hash::check($dto->password, $user->password)) {
            RateLimiter::hit($throttleKey, 60);

            $remaining = RateLimiter::remaining($throttleKey, 5);
            $message = $remaining > 0
                ? "Invalid credentials. You have {$remaining} attempt(s) remaining."
                : 'Invalid credentials. Your account is temporarily locked.';

            throw ValidationException::withMessages([
                'email' => [$message],
            ]);
        }

        if (! $user->hasVerifiedEmail()) {
            throw ValidationException::withMessages([
                'email' => ['Please verify your email address before logging in.'],
            ]);
        }

        RateLimiter::clear($throttleKey);

        return $user;
    }
}
