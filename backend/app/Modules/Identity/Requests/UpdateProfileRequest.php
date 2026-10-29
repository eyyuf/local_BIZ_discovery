<?php

namespace App\Modules\Identity\Requests;
use Illuminate\Validation\Rule;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool{
        return true;
    }
    public function rules(): array{
        return[
            'name'=>['sometimes','string', 'max:255'],
            'email'=>['sometimes','email', 'max:255', Rule::unique('users', 'email')->ignore($this->user()->id)],
            'avatar'=>['sometimes','image','mimes:jpeg,png,jpg,webp', 'max:2048'],
            'current_password' => ['required_with:password', 'current_password'],
            'password'         => ['sometimes', 'string', 'min:8', 'confirmed'],
        ];
    }
}
