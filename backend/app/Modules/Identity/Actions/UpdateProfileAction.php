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
            'role'  => $dto->role,
        ], fn ($val) => $val !== null);

        if ($dto->password) {
            $payload['password'] = Hash::make($dto->password);
        }

        if ($dto->avatar) {
            $path = $dto->avatar->store('local_biz/avatars', 'cloudinary');
            $payload['avatar'] = \Illuminate\Support\Facades\Storage::disk('cloudinary')->url($path);
        }

        if (! empty($payload)) {
            $user->update($payload);
        }

        return $user;
    }
}
