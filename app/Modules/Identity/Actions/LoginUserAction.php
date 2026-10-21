<?php

namespace App\Modules\Identity\Actions;
use Illuminate\Support\Facades\Hash;

use App\Modules\Identity\Models\User;
class LoginUserAction
{
    public function execute(array $data): User{
        $user=User::where('email', $data['email'])->first();
        if(!$user ||!Hash::check($data['password'], $user->password)){
           throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }
        return $user;
    }
}

