<?php

namespace App\Modules\Review\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'message.required' => 'Message text is required.',
            'message.max'      => 'Message text cannot exceed 2000 characters.',
        ];
    }
}
