<?php

namespace App\Modules\Identity\DTOs;

use App\Modules\Identity\Requests\LoginRequest;

readonly class LoginDTO
{
    public function __construct(
        public string $email,
        public string $password,
        public bool $remember = false,
    ) {}

    public static function fromRequest(LoginRequest $request): self
    {
        return new self(
            email: (string) $request->validated('email'),
            password: (string) $request->validated('password'),
            remember: (bool) $request->boolean('remember', true),
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            email: (string) ($data['email'] ?? ''),
            password: (string) ($data['password'] ?? ''),
            remember: (bool) ($data['remember'] ?? false),
        );
    }
}

