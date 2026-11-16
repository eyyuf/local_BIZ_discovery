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
        $role = $dto->role ?: 'customer';
        $isCustomer = ($role === 'customer');

        $user = User::create([
            'name'              => $dto->name,
            'email'             => $dto->email,
            'password'          => Hash::make($dto->password),
            'role'              => $role,
            'email_verified_at' => $isCustomer ? now() : null,
        ]);

        if (! $isCustomer) {
            event(new Registered($user));
        }

        return $user;
    }
}
