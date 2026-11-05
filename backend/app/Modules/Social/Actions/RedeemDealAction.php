<?php

namespace App\Modules\Social\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Social\DTOs\ClaimDealDTO;
use App\Modules\Social\Models\DealClaim;

class RedeemDealAction
{
    /**
     * Execute deal voucher redemption logic.
     */
    public function execute(DealClaim $claim, User $user): ClaimDealDTO
    {
        // TODO: Implement voucher redemption logic
    }
}
