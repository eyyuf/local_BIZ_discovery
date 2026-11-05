<?php

namespace App\Modules\Identity\Actions;

use App\Modules\Identity\DTOs\LoginDTO;
use App\Modules\Identity\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginUserAction
{
    public function execute(LoginDTO|array $data): User
    {
        $dto = $data instanceof LoginDTO ? $data : LoginDTO::fromArray($data);

        $user = User::where('email', $dto->email)->first();

        if (! $user || ! Hash::check($dto->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        if (! $user->hasVerifiedEmail()) {
            throw ValidationException::withMessages([
                'email' => ['Please verify your email address before logging in.'],
            ]);
        }

        return $user;
    }
}
