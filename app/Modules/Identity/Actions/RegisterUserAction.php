<?php

namespace App\Modules\Identity\Actions;
use Illuminate\Support\Facades\Hash;

use App\Modules\Identity\Models\User;
class RegisterUserAction
{
    public function execute(array $data): User{
        $user= User::create([
            'name'=>$data['name'],
            'email'=> $data['email'],
            'password'=>Hash::make($data['password']),
        ]);
        return $user;

    }
}
