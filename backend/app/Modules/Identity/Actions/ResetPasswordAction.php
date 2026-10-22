<?php
namespace App\Modules\Identity\Actions;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
class ResetPasswordAction
{
    public function execute(array $data): string
    {
        $status= Password::reset($data, function($user, string $password){
            $user->forceFill([
                'password'=>Hash::make($password),
            ])->save();
        });
        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }
        return __($status);
        

    }
}       