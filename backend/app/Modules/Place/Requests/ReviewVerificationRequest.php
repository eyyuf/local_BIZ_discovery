<?php

namespace App\Modules\Place\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewVerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'decision' => ['required', 'string', 'in:approved,rejected'],
            'notes'    => ['nullable', 'string', 'max:500'],
        ];
    }
}
