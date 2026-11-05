<?php

namespace App\Modules\Identity\DTOs;

use App\Modules\Identity\Requests\UpdateProfileRequest;
use Illuminate\Http\UploadedFile;

readonly class UpdateProfileDTO
{
    public function __construct(
        public ?string $name = null,
        public ?string $email = null,
        public ?string $password = null,
        public ?UploadedFile $avatar = null,
    ) {}

    public static function fromRequest(UpdateProfileRequest $request): self
    {
        return new self(
            name: $request->has('name') ? (string) $request->validated('name') : null,
            email: $request->has('email') ? (string) $request->validated('email') : null,
            password: $request->has('password') ? (string) $request->validated('password') : null,
            avatar: $request->file('avatar'),
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'] ?? null,
            email: $data['email'] ?? null,
            password: $data['password'] ?? null,
            avatar: isset($data['avatar']) && $data['avatar'] instanceof UploadedFile ? $data['avatar'] : null,
        );
    }
}

