<?php

namespace App\Modules\Review\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FavoriteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'place_id'   => $this->place_id,
            'created_at' => $this->created_at?->toIso8601String(),
            'place'      => $this->whenLoaded('place'),
        ];
    }
}
