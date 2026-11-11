<?php

namespace App\Modules\Place\Requests;

use App\Modules\Place\Models\MenuItem;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $menuItem = $this->route('menuItem');

        if (! $menuItem instanceof MenuItem) {
            $menuItem = MenuItem::findOrFail($menuItem);
        }

        $placeId = $menuItem->section?->place_id;

        return [
            'menu_section_id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('menu_sections', 'id')
                    ->where('place_id', $placeId ?? -1),
            ],

            'name' => ['sometimes', 'required', 'string', 'max:255'],

            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],

            'price' => [
                'sometimes',
                'required',
                'numeric',
                'min:0',
                'max:999999.99',
            ],

            'image_url' => ['sometimes', 'nullable', 'string', 'url', 'max:2048'],

            'is_available' => ['sometimes', 'required', 'boolean'],
        ];
    }
}
