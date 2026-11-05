<?php

namespace App\Modules\Review\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreResponseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'response' => ['required', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'response.required' => 'Response text is required.',
        ];
    }
}
