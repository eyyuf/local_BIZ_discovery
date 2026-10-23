<?php

namespace App\Modules\Place\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePlaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'=>["sometimes",'string','max:255'],
            'description'=>["nullable",'string'],
            'address'=>["sometimes",'string','max:255'],
            'phone'=>["nullable",'string','max:255'],
            'website'=>["nullable",'string','max:255'],
            'is_active'=>["sometimes",'boolean'],    
            'latitude'=>["nullable",'numeric','between:-90,90' ],
            'longitude'=>["nullable",'numeric','between:-180,180' ]        
        ];
    }
}
