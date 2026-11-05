<?php

namespace App\Modules\Review\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResponseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'review_id'  => $this->review_id,
            'response'   => $this->response,
            'created_at' => $this->created_at?->toIso8601String(),
            'author'     => [
                'id'   => $this->author?->id,
                'name' => $this->author?->name,
            ],
        ];
    }
}
