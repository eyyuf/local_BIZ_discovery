<?php

namespace App\Modules\Social\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Social\DTOs\ClaimDealDTO;
use App\Modules\Social\Models\DealClaim;
use Illuminate\Validation\ValidationException;

class RedeemDealAction
{
    public function execute(DealClaim $claim, User $user): ClaimDealDTO
    {
        if ((int) $claim->user_id !== (int) $user->id && (int) $claim->post?->place?->user_id !== (int) $user->id) {
            throw ValidationException::withMessages([
                'claim' => ['You are not authorized to redeem this voucher.'],
            ]);
        }

        if ($claim->status === 'redeemed') {
            throw ValidationException::withMessages([
                'claim' => ['This voucher has already been redeemed.'],
            ]);
        }

        if ($claim->isExpired()) {
            $claim->update(['status' => 'expired']);
            throw ValidationException::withMessages([
                'claim' => ['This voucher has expired and can no longer be used.'],
            ]);
        }

        $claim->update([
            'status'      => 'redeemed',
            'redeemed_at' => now(),
        ]);

        return ClaimDealDTO::fromModel($claim->fresh());
    }
}

