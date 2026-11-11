<?php

namespace App\Modules\Place\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePlaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'=>['required','string'],
            'description'=>['nullable','string'],
            'address'=>['required', 'string'],
            'phone'=>['required','string'],
            'website'=>['nullable', 'url', 'max:255'],
            'latitude'=> ['nullable', 'numeric', 'between:-90,90'],
            'longitude'=> ['nullable', 'numeric', 'between:-180,180'],        
            'is_active'   => ['sometimes', 'boolean'],

        ];
    }
    
}
