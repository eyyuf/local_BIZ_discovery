<?php

namespace App\Modules\Discovery\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExploreSectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'key'         => $this->resource['key'] ?? null,
            'title'       => $this->resource['title'] ?? null,
            'description' => $this->resource['description'] ?? null,
            'places'      => SearchResultResource::collection($this->resource['places'] ?? []),
        ];
    }
}
