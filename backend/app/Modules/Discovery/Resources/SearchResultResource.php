<?php

namespace App\Modules\Discovery\Resources;

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
            'latitude'    => $this->latitude,
            'longitude'   => $this->longitude,
            'distance_km' => $this->when(isset($this->distance_km), $this->distance_km),
            'phone'       => $this->phone,
            'website'     => $this->website,
            'is_active'   => (bool) $this->is_active,
        ];
    }
}
