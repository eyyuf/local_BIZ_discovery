<?php

namespace App\Modules\Identity\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool{
        return true;
    }
    public function rules(): array{
        return [
            'email'=>['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password'=>['required', 'string', 'min:8', 'confirmed'],   
        ];

    }
}
