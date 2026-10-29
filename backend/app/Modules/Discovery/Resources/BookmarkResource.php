<?php

namespace App\Modules\Discovery\Resources;

use App\Modules\Place\Resources\PlaceDetailResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookmarkResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'place'      => new PlaceDetailResource($this->whenLoaded('place')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
