<?php

namespace App\Modules\Identity\DTOs;

use App\Modules\Identity\Requests\RegisterRequest;

readonly class RegisterUserDTO
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public string $role = 'customer',
    ) {}

    public static function fromRequest(RegisterRequest $request): self
    {
        return new self(
            name: (string) $request->validated('name'),
            email: (string) $request->validated('email'),
            password: (string) $request->validated('password'),
            role: (string) $request->validated('role', 'customer'),
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            name: (string) ($data['name'] ?? ''),
            email: (string) ($data['email'] ?? ''),
            password: (string) ($data['password'] ?? ''),
            role: (string) ($data['role'] ?? 'customer'),
        );
    }
}

