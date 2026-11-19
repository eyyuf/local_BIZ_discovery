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
            'notes'    => ['nullable', 'string', 'max:1000', 'required_if:decision,rejected'],
        ];
    }

    public function messages(): array
    {
        return [
            'decision.required'  => 'A review decision (approved or rejected) is required.',
            'decision.in'        => 'The decision must be either "approved" or "rejected".',
            'notes.required_if'  => 'A meaningful rejection reason is required when rejecting verification.',
        ];
    }
}
