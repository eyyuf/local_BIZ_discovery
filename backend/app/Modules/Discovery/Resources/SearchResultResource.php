<?php

namespace App\Modules\Discovery\Resources;

use App\Modules\Place\Resources\PlaceImageResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SearchResultResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'slug'        => $this->slug,
            'description' => $this->description,
            'address'     => $this->address,
            'latitude'    => $this->latitude !== null ? (float) $this->latitude : null,
            'longitude'   => $this->longitude !== null ? (float) $this->longitude : null,
            'distance_km' => $this->when(
                isset($this->distance_km),
                fn () => round((float) $this->distance_km, 2)
            ),
            'phone'       => $this->phone,
            'website'     => $this->website,
            'is_active'   => (bool) $this->is_active,
            'cover_image' => $this->relationLoaded('images')
                ? ($this->images->firstWhere('is_cover', true)?->url ?? $this->images->first()?->url)
                : null,
            'images'      => $this->when(
                $this->relationLoaded('images'),
                fn () => PlaceImageResource::collection($this->images)
            ),
        ];
    }
}
