<?php

namespace App\Modules\Identity\Actions;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ResetPasswordAction
{
    public function execute(array $data): string
    {
        $status = Password::reset($data, function ($user, string $password) {
            $user->forceFill([
                'password'  => Hash::make($password),
                'locked_at' => null,
            ])->save();

            $throttleKey = Str::transliterate(Str::lower($user->email) . '|' . request()->ip());
            RateLimiter::clear($throttleKey);
        });

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return __($status);
    }
}
