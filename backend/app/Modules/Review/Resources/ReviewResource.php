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
            'rating'       => (int) $this->rating,
            'comment'      => $this->comment,
            'is_published' => (bool) $this->is_published,
            'created_at'   => $this->created_at?->toIso8601String(),
            'author'       => [
                'id'    => $this->author?->id,
                'name'  => $this->author?->name,
                'avatar' => $this->author?->avatar,
            ],
            'response'     => new ReviewResponseResource($this->whenLoaded('response')),
        ];
    }
}
