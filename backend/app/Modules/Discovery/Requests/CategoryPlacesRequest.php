<?php

namespace App\Modules\Discovery\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryPlacesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'per_page' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:100'],
            'page'     => ['sometimes', 'nullable', 'integer', 'min:1'],
        ];
    }
}
