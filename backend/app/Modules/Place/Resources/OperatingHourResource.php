<?php

namespace App\Modules\Place\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OperatingHourResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'place_id'    => $this->place_id,
            'day_of_week' => (int) $this->day_of_week,
            'opens_at'    => $this->opens_at ? substr($this->opens_at, 0, 5) : null,
            'closes_at'   => $this->closes_at ? substr($this->closes_at, 0, 5) : null,
            'is_closed'   => (bool) $this->is_closed,
        ];
    }
}
