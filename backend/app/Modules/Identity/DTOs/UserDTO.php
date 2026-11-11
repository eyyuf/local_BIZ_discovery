<?php

namespace App\Modules\Identity\DTOs;

use App\Modules\Identity\Models\User;

readonly class UserDTO
{
    public function __construct(
        public int $id,
        public string $name,
        public string $email,
        public ?string $avatar = null,
        public bool $isEmailVerified = false,
    ) {}

    public static function fromModel(User $user): self
    {
        return new self(
            id: (int) $user->id,
            name: $user->name,
            email: $user->email,
            avatar: $user->avatar,
            isEmailVerified: $user->hasVerifiedEmail(),
        );
    }
}

