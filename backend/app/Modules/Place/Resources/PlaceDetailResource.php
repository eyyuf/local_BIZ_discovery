<?php

namespace App\Modules\Place\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlaceDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'slug'            => $this->slug,
            'description'     => $this->description,
            'address'         => $this->address,
            'latitude'        => $this->latitude,
            'longitude'       => $this->longitude,
            'phone'           => $this->phone,
            'website'         => $this->website,
            'is_open'         => (bool) ($this->resource instanceof \App\Modules\Place\Models\Place ? $this->resource->isOpen() : ($this->is_open ?? false)),
            'is_active'             => (bool) $this->is_active,
            'is_verified'           => (bool) ($this->is_verified ?? false),
            'verification_status'   => $this->verification_status ?? 'unverified',
            'verified_at'           => $this->verified_at?->toISOString(),
            'tax_id'                => $this->tax_id,
            'telebirr_merchant_id'  => $this->telebirr_merchant_id,
            'verification_document' => $this->verification_document
                ? (str_starts_with($this->verification_document, 'http')
                    ? $this->verification_document
                    : asset('storage/' . $this->verification_document))
                : null,
            'verification_notes'    => $this->verification_notes,
            'average_rating'        => $this->average_rating,
            'total_ratings'   => (int) ($this->total_ratings ?? 0),
            'created_at'      => $this->created_at?->toISOString(),
            'updated_at'      => $this->updated_at?->toISOString(),
            'operating_hours' => OperatingHourResource::collection($this->whenLoaded('operatingHours')),
            'menu_sections'   => $this->whenLoaded('menuSections'),
            'images'          => PlaceImageResource::collection($this->whenLoaded('images')),
            'cover_image'     => $this->relationLoaded('images')
                ? ($this->images->firstWhere('is_cover', true)?->url ?? $this->images->first()?->url)
                : null,
        ];
    }
}
