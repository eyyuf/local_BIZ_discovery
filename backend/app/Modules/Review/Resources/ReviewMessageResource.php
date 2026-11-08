<?php

namespace App\Modules\Review\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'review_id'  => $this->review_id,
            'message'    => $this->message,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'author'     => [
                'id'     => $this->author?->id,
                'name'   => $this->author?->name,
                'avatar' => $this->author?->avatar,
            ],
        ];
    }
}
