<?php

namespace App\Modules\Identity\Actions;

use App\Modules\Identity\DTOs\RegisterUserDTO;
use App\Modules\Identity\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Hash;

class RegisterUserAction
{
    public function execute(RegisterUserDTO|array $data): User
    {
        $dto = $data instanceof RegisterUserDTO ? $data : RegisterUserDTO::fromArray($data);

        $user = User::create([
            'name'     => $dto->name,
            'email'    => $dto->email,
            'password' => Hash::make($dto->password),
            'role'     => $dto->role,
        ]);

        event(new Registered($user));

        return $user;
    }
}
