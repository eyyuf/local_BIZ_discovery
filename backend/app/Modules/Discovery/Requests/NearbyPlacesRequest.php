<?php

namespace App\Modules\Discovery\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NearbyPlacesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lat'    => ['required', 'numeric', 'between:-90,90'],
            'lng'    => ['required', 'numeric', 'between:-180,180'],
            'radius' => ['nullable', 'numeric', 'min:0.5', 'max:50'],
            'limit'  => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
