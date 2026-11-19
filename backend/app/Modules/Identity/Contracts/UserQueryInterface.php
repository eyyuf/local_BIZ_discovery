<?php

namespace App\Modules\Identity\Contracts;

use App\Modules\Identity\DTOs\UserDTO;

interface UserQueryInterface
{
    public function findById(int $id): ?UserDTO;

    public function findByEmail(string $email): ?UserDTO;

    public function userExists(int $id): bool;
}

