<?php

namespace App\Modules\Social\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id'                  => (int) $this->id,
            'place_id'            => (int) $this->place_id,
            'user_id'             => (int) $this->user_id,
            'title'               => $this->title,
            'content'             => $this->content,
            'deal_type'           => $this->deal_type,
            'discount_percentage' => $this->discount_percentage !== null ? (float) $this->discount_percentage : null,
            'discount_code'       => $this->discount_code,
            'image_url'           => $this->image_url,
            'max_claims'          => $this->max_claims !== null ? (int) $this->max_claims : null,
            'claims_count'        => (int) $this->claims_count,
            'remaining_claims'    => $this->max_claims !== null ? max(0, (int) $this->max_claims - (int) $this->claims_count) : null,
            'expires_at'          => $this->expires_at?->toIso8601String(),
            'is_active'           => (bool) $this->is_active,
            'likes_count'         => (int) $this->likes_count,
            'is_liked_by_user'    => $user ? $this->likes()->where('user_id', $user->id)->exists() : false,
            'is_claimed_by_user'  => $user ? $this->claims()->where('user_id', $user->id)->exists() : false,
            'place'               => [
                'id'      => $this->place?->id,
                'name'    => $this->place?->name,
                'slug'    => $this->place?->slug,
                'address' => $this->place?->address,
            ],
            'author'              => [
                'id'   => $this->author?->id,
                'name' => $this->author?->name,
            ],
            'created_at'          => $this->created_at?->toIso8601String(),
            'updated_at'          => $this->updated_at?->toIso8601String(),
        ];
    }
}
