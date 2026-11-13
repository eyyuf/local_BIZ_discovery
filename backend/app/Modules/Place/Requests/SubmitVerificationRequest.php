<?php

namespace App\Modules\Place\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitVerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'verification_type'    => ['required', 'string', 'in:telebirr,document,tin'],
            'telebirr_merchant_id' => ['required_if:verification_type,telebirr', 'nullable', 'string', 'max:20'],
            'tax_id'               => ['required_if:verification_type,tin', 'nullable', 'string', 'max:50'],
            'document'             => ['required_if:verification_type,document', 'nullable', 'file', 'mimes:jpeg,jpg,png,pdf,webp', 'max:10240'],
        ];
    }
}
