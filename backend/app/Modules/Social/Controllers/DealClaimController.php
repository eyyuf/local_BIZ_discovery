<?php

namespace App\Modules\Social\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Social\Actions\ClaimDealAction;
use App\Modules\Social\Actions\RedeemDealAction;
use App\Modules\Social\Models\DealClaim;
use App\Modules\Social\Models\Post;
use App\Modules\Social\Resources\DealClaimResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DealClaimController extends Controller
{
    public function claim(Request $request, Post $post, ClaimDealAction $action): JsonResponse
    {
        $dto = $action->execute($post, $request->user());
        $claim = DealClaim::find($dto->id);

        return (new DealClaimResource($claim))
            ->additional(['message' => 'Voucher claimed successfully! Show this code when ordering or paying.'])
            ->response()
            ->setStatusCode(201);
    }

    public function redeem(Request $request, DealClaim $claim, RedeemDealAction $action): JsonResponse
    {
        $dto = $action->execute($claim, $request->user());
        $freshClaim = DealClaim::find($dto->id);

        return (new DealClaimResource($freshClaim))
            ->additional(['message' => 'Voucher marked as redeemed successfully!'])
            ->response()
            ->setStatusCode(200);
    }

    public function myClaims(Request $request): JsonResponse
    {
        $claims = $request->user()
            ->dealClaims()
            ->with(['post.place'])
            ->latest()
            ->paginate(15);

        return DealClaimResource::collection($claims)->response();
    }
}

