<?php

namespace App\Modules\Place\Requests;

use App\Modules\Place\Models\Place;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $place = $this->route('place');
        $placeId = $place instanceof Place ? $place->id : $place;

        return [
            'menu_section_id' => [
                'required',
                'integer',
                Rule::exists('menu_sections', 'id')->where('place_id', $placeId),
            ],
            'name'         => ['required', 'string', 'max:255'],
            'description'  => ['nullable', 'string', 'max:1000'],
            'price'        => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'image_url'    => ['nullable', 'string', 'url', 'max:2048'],
            'is_available' => ['sometimes', 'boolean'],
        ];
    }
}
