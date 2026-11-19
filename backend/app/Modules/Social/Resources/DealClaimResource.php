<?php

namespace App\Modules\Social\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DealClaimResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => (int) $this->id,
            'post_id'      => (int) $this->post_id,
            'user_id'      => (int) $this->user_id,
            'voucher_code' => $this->voucher_code,
            'status'       => $this->status,
            'claimed_at'   => $this->claimed_at?->toIso8601String(),
            'redeemed_at'  => $this->redeemed_at?->toIso8601String(),
            'expires_at'   => $this->expires_at?->toIso8601String(),
            'deal'         => new PostResource($this->whenLoaded('post')),
        ];
    }
}

