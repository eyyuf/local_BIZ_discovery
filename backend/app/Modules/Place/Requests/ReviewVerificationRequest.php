<?php

namespace App\Modules\Place\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewVerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && ($user->isAdmin() || $user->role === 'admin');
    }

    public function rules(): array
    {
        return [
            'decision' => ['required', 'string', 'in:approved,rejected'],
            'notes'    => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'decision.required' => 'A review decision (approved or rejected) is required.',
            'decision.in'       => 'The decision must be either "approved" or "rejected".',
        ];
    }
}
