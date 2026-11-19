<?php

namespace App\Modules\Identity\Services;

use App\Modules\Identity\Contracts\UserQueryInterface;
use App\Modules\Identity\DTOs\UserDTO;
use App\Modules\Identity\Models\User;

class UserQueryService implements UserQueryInterface
{
    public function findById(int $id): ?UserDTO
    {
        $user = User::find($id);

        return $user ? UserDTO::fromModel($user) : null;
    }

    public function findByEmail(string $email): ?UserDTO
    {
        $user = User::where('email', $email)->first();

        return $user ? UserDTO::fromModel($user) : null;
    }

    public function userExists(int $id): bool
    {
        return User::where('id', $id)->exists();
    }
}

