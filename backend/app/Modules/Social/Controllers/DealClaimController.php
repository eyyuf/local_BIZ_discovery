<?php

namespace App\Modules\Social\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Social\Actions\ClaimDealAction;
use App\Modules\Social\Actions\RedeemDealAction;
use App\Modules\Social\Models\DealClaim;
use App\Modules\Social\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DealClaimController extends Controller
{
    public function claim(Request $request, Post $post, ClaimDealAction $action): JsonResponse
    {
        // TODO: Claim deal voucher for authenticated user
    }

    public function redeem(Request $request, DealClaim $claim, RedeemDealAction $action): JsonResponse
    {
        // TODO: Redeem voucher code for deal claim
    }

    public function myClaims(Request $request): JsonResponse
    {
        // TODO: Return paginated deal claims for authenticated user
    }
}
