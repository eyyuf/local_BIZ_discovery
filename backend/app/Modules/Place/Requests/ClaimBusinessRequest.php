<?php

namespace App\Modules\Place\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClaimBusinessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'tax_id'                   => ['required', 'string', 'regex:/^\d{9,12}$/'],
            'manager_name'             => ['required', 'string', 'min:3', 'max:150'],
            'claim_role'               => ['required', 'string', 'in:owner,general_manager,managing_partner,authorized_agent'],
            'claim_contact_phone'      => ['required', 'string', 'min:9', 'max:25'],
            'claim_notes'              => ['nullable', 'string', 'max:1000'],
            'declaration_confirmed'    => ['required', 'accepted'],

            // Trade License file or URL (must provide at least one proof)
            'license_document'         => ['nullable', 'file', 'mimes:jpeg,png,jpg,webp,pdf', 'max:10240'],
            'verification_document'    => ['nullable', 'file', 'mimes:jpeg,png,jpg,webp,pdf', 'max:10240'],
            'license_document_url'     => ['nullable', 'string', 'url', 'max:2048'],
            'verification_document_url'=> ['nullable', 'string', 'url', 'max:2048'],

            // Fayda National ID (FAN/FIN)
            'fayda_fin'                => ['nullable', 'string', 'max:30'],
            'fayda_document'           => ['nullable', 'file', 'mimes:jpeg,png,jpg,webp,pdf', 'max:10240'],
            'fayda_id'                 => ['nullable', 'file', 'mimes:jpeg,png,jpg,webp,pdf', 'max:10240'],
            'fayda_document_url'       => ['nullable', 'string', 'url', 'max:2048'],

            // Telebirr Merchant ID
            'telebirr_merchant_id'     => ['nullable', 'string', 'regex:/^\d{5,8}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'tax_id.required'              => 'The 10-digit Taxpayer Identification Number (TIN / የግብር ከፋይ መለያ ቁጥር) is required.',
            'tax_id.regex'                 => 'The TIN number must be a valid 10-digit number.',
            'manager_name.required'        => 'The legal General Manager name (as stated on official Ethiopian trade license) is required.',
            'claim_role.required'          => 'Please specify your official capacity or role with this business.',
            'claim_role.in'                => 'Please select a valid role (Owner, General Manager, Managing Partner, or Authorized Representative).',
            'claim_contact_phone.required' => 'A direct Ethiopian phone number is required for verification contact.',
            'declaration_confirmed.accepted' => 'You must legally certify under penalty of law that you are authorized to claim this business.',
            'license_document.mimes'       => 'The Trade License document must be an image (JPEG, PNG, WEBP) or PDF.',
            'fayda_document.mimes'         => 'The Fayda ID document must be an image (JPEG, PNG, WEBP) or PDF.',
            'telebirr_merchant_id.regex'   => 'The Telebirr Merchant ID must be a 5 to 8 digit number.',
        ];
    }
}
