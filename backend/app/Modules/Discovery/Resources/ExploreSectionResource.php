<?php

namespace App\Modules\Discovery\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExploreSectionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'key'         => $this->resource['key'] ?? null,
            'title'       => $this->resource['title'] ?? null,
            'description' => $this->resource['description'] ?? null,
            'places'      => $this->when(
                isset($this->resource['places']),
                fn () => SearchResultResource::collection($this->resource['places'])
            ),
            'categories'  => $this->when(
                isset($this->resource['categories']),
                fn () => CategoryResource::collection($this->resource['categories'])
            ),
        ];
    }
}
