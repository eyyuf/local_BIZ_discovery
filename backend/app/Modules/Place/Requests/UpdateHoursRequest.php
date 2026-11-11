<?php

namespace App\Modules\Place\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHoursRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Allows 0 to 7 operating days. An empty array means closed all week.
            'hours'               => ['present', 'array', 'max:7'],

            // Strictly allow only operating-hours keys: no is_closed required or accepted
            'hours.*'             => ['required', 'array:day_of_week,opens_at,closes_at'],

            'hours.*.day_of_week' => [
                'required',
                'integer',
                'between:0,6',
                'distinct',
            ],

            'hours.*.opens_at'    => [
                'required',
                'date_format:H:i',
            ],

            'hours.*.closes_at'   => [
                'required',
                'date_format:H:i',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'hours.present'                => 'The hours payload must be present.',
            'hours.*.day_of_week.distinct' => 'Each operating day can only be submitted once.',
            'hours.*.opens_at.required'    => 'Opening time is required for each operating day.',
            'hours.*.opens_at.date_format' => 'Opening time must use 24-hour HH:MM format.',
            'hours.*.closes_at.required'   => 'Closing time is required for each operating day.',
            'hours.*.closes_at.date_format' => 'Closing time must use 24-hour HH:MM format.',
        ];
    }
}
