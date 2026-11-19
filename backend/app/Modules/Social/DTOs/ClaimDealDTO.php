<?php

namespace App\Modules\Social\DTOs;

use App\Modules\Social\Models\DealClaim;

readonly class ClaimDealDTO
{
    public function __construct(
        public int $id,
        public int $postId,
        public int $userId,
        public string $voucherCode,
        public string $status,
        public string $claimedAt,
        public ?string $redeemedAt = null,
        public ?string $expiresAt = null,
    ) {}

    public static function fromModel(DealClaim $claim): self
    {
        return new self(
            id: (int) $claim->id,
            postId: (int) $claim->post_id,
            userId: (int) $claim->user_id,
            voucherCode: $claim->voucher_code,
            status: $claim->status,
            claimedAt: $claim->claimed_at->toIso8601String(),
            redeemedAt: $claim->redeemed_at?->toIso8601String(),
            expiresAt: $claim->expires_at?->toIso8601String(),
        );
    }
}

