<?php

namespace App\Modules\Place\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitVerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        $place = $this->route('place');
        $user = $this->user();

        if (!$place || !$user) {
            return false;
        }

        return (int) $place->user_id === (int) $user->id || $user->isAdmin();
    }

    public function rules(): array
    {
        return [
            'verification_type'        => ['nullable', 'string', 'in:tin_fayda,fayda,tin,document,telebirr'],
            'tax_id'                   => ['nullable', 'string', 'regex:/^\d{9,12}$/'],
            'manager_name'             => ['nullable', 'string', 'min:3', 'max:150'],
            'fayda_fin'                => ['nullable', 'string', 'max:30'],
            'telebirr_merchant_id'     => ['nullable', 'string', 'regex:/^\d{5,8}$/'],
            
            // Trade License file or URL
            'license_document'         => ['nullable', 'file', 'mimes:jpeg,png,jpg,webp,pdf', 'max:10240'],
            'verification_document'    => ['nullable', 'file', 'mimes:jpeg,png,jpg,webp,pdf', 'max:10240'],
            'license_document_url'     => ['nullable', 'string', 'url', 'max:2048'],
            'verification_document_url'=> ['nullable', 'string', 'url', 'max:2048'],

            // Fayda National ID file or URL
            'fayda_document'           => ['nullable', 'file', 'mimes:jpeg,png,jpg,webp,pdf', 'max:10240'],
            'fayda_id'                 => ['nullable', 'file', 'mimes:jpeg,png,jpg,webp,pdf', 'max:10240'],
            'fayda_document_url'       => ['nullable', 'string', 'url', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'tax_id.regex' => 'The Taxpayer Identification Number (TIN / የግብር ከፋይ መለያ ቁጥር) must be a 10-digit number.',
            'telebirr_merchant_id.regex' => 'The Telebirr Merchant ID must be a 5 to 8 digit number.',
            'license_document.mimes' => 'The Trade License document must be an image (JPEG, PNG, WEBP) or PDF.',
            'fayda_document.mimes' => 'The Fayda ID document must be an image (JPEG, PNG, WEBP) or PDF with visible QR code.',
        ];
    }
}
