<?php

namespace App\Modules\Review\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'comment' => ['required', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'comment.required' => 'The review comment is required.',
            'comment.max'      => 'The comment may not exceed 2000 characters.',
        ];
    }
}
