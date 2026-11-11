<?php

namespace App\Modules\Discovery\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SearchPlacesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'q'          => ['nullable', 'string', 'max:255'],
            'lat'        => ['nullable', 'numeric', 'between:-90,90'],
            'lng'        => ['nullable', 'numeric', 'between:-180,180'],
            'radius'     => ['nullable', 'numeric', 'min:0.5', 'max:100'],
            'category'   => ['nullable', 'string'],
            'open_now'   => ['nullable', 'boolean'],
            'price_tier' => ['nullable', 'string', 'in:$,$$,$$$,$$$$'],
            'sort_by'    => ['nullable', 'string', 'in:distance,rating,popular,newest'],
            'page'       => ['nullable', 'integer', 'min:1'],
            'per_page'   => ['nullable', 'integer', 'min:1', 'max:50'],
        ];
    }
}
