<?php

namespace App\Modules\Review\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'place_id'     => $this->place_id,
            'comment'      => $this->comment,
            'is_published' => (bool) $this->is_published,
            'created_at'   => $this->created_at?->toISOString(),
            'updated_at'   => $this->updated_at?->toISOString(),
            'author'       => [
                'id'     => $this->author?->id,
                'name'   => $this->author?->name,
                'avatar' => $this->author?->avatar,
            ],
            'messages'     => ReviewMessageResource::collection($this->whenLoaded('messages')),
        ];
    }
}
