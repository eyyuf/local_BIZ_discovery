<?php

namespace App\Modules\Identity\Actions;

use App\Modules\Identity\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MagicLoginAction
{
    public function execute(Request $request, int|string $id): User
    {
        if (! $request->hasValidSignature()) {
            throw ValidationException::withMessages([
                'email' => ['The login link is invalid or has expired.'],
            ])->status(401);
        }

        $user = User::findOrFail($id);

        $user->update(['locked_at' => null]);

        $throttleKey = Str::transliterate(Str::lower($user->email) . '|' . $request->ip());
        RateLimiter::clear($throttleKey);

        return $user;
    }
}
