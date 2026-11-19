<?php

namespace App\Modules\Review\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitPlaceRatingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'between:1,5'],
        ];
    }

    public function messages(): array
    {
        return [
            'rating.required' => 'A rating is required.',
            'rating.integer'  => 'The rating must be an integer.',
            'rating.between'  => 'The rating must be between 1 and 5 stars.',
        ];
    }
}
