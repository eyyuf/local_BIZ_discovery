<?php

namespace App\Modules\Identity\Actions;
use App\Modules\Identity\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Hash;

class RegisterUserAction
{
    public function execute(array $data): User{
        $user= User::create([
            'name'=>$data['name'],
            'email'=> $data['email'],
            'password'=>Hash::make($data['password']),
        ]);
        event(new Registered($user));
        return $user;

    }
}
