<?php

namespace App\Modules\Social\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'               => ['required', 'string', 'max:255'],
            'content'             => ['required', 'string'],
            'deal_type'           => ['nullable', 'string', 'in:deal,announcement,update,event'],
            'discount_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'discount_code'       => ['nullable', 'string', 'max:50'],
            'image_url'           => ['nullable', 'url', 'max:2048'],
            'max_claims'          => ['nullable', 'integer', 'min:1'],
            'expires_at'          => ['nullable', 'date', 'after:now'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'          => 'A post title is required.',
            'content.required'        => 'Post content cannot be empty.',
            'deal_type.in'            => 'Deal type must be one of: deal, announcement, update, event.',
            'discount_percentage.min' => 'Discount percentage cannot be negative.',
            'discount_percentage.max' => 'Discount percentage cannot exceed 100%.',
            'expires_at.after'        => 'Expiration date must be in the future.',
        ];
    }
}
