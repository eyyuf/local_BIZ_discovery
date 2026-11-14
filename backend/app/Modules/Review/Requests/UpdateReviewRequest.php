<?php

namespace App\Modules\Review\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rating'  => ['sometimes', 'integer', 'between:1,5'],
            'comment' => ['required', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'rating.integer'   => 'Rating must be an integer between 1 and 5.',
            'rating.between'   => 'Rating must be between 1 and 5 stars.',
            'comment.required' => 'The review comment is required.',
            'comment.max'      => 'The comment may not exceed 2000 characters.',
        ];
    }
}
