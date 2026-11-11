<?php

namespace App\Modules\Place\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlaceImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'image_url'     => $this->url,
            'is_cover'      => (bool) $this->is_cover,
            'display_order' => (int) $this->display_order,
            'created_at'    => $this->created_at?->toISOString(),
        ];
    }
}

