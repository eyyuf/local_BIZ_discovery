<?php

namespace App\Modules\Identity\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpgradeToOwnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'business_name' => ['required', 'string', 'max:255'],
            'phone'         => ['required', 'string', 'max:50'],
            'address'       => ['required', 'string', 'max:255'],
            'description'   => ['nullable', 'string', 'max:1000'],
            'website'       => ['nullable', 'url', 'max:255'],
        ];
    }
}
