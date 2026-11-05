<?php

namespace App\Modules\Identity\Actions;

use App\Modules\Identity\DTOs\UpdateProfileDTO;
use App\Modules\Identity\Models\User;
use Illuminate\Support\Facades\Hash;

class UpdateProfileAction
{
    public function execute(User $user, UpdateProfileDTO|array $data): User
    {
        $dto = $data instanceof UpdateProfileDTO ? $data : UpdateProfileDTO::fromArray($data);

        $payload = array_filter([
            'name'  => $dto->name,
            'email' => $dto->email,
        ], fn ($val) => $val !== null);

        if ($dto->password) {
            $payload['password'] = Hash::make($dto->password);
        }

        if ($dto->avatar) {
            $payload['avatar'] = $dto->avatar->store('avatars', 'public');
        }

        if (! empty($payload)) {
            $user->update($payload);
        }

        return $user;
    }
}
