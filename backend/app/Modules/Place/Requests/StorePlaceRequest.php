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
            // TODO: Define validation rules for storing a place
        ];
    }
}
