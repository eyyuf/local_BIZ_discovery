<?php

namespace App\Modules\Social\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Social\DTOs\ClaimDealDTO;
use App\Modules\Social\Models\DealClaim;
use App\Modules\Social\Models\Post;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ClaimDealAction
{
    public function execute(Post $post, User $user): ClaimDealDTO
    {
        if (! $post->is_active || ($post->expires_at && $post->expires_at->isPast())) {
            throw ValidationException::withMessages([
                'deal' => ['This deal is no longer active or has expired.'],
            ]);
        }

        return DB::transaction(function () use ($post, $user) {
            $existing = DealClaim::where('post_id', $post->id)
                ->where('user_id', $user->id)
                ->first();

            if ($existing) {
                throw ValidationException::withMessages([
                    'deal' => ['You have already claimed this deal.'],
                ]);
            }

            if ($post->max_claims !== null && $post->claims_count >= $post->max_claims) {
                throw ValidationException::withMessages([
                    'deal' => ['All available vouchers for this deal have been claimed.'],
                ]);
            }

            $voucherCode = 'VCH-' . strtoupper(Str::random(4)) . '-' . rand(1000, 9999);

            $claim = DealClaim::create([
                'post_id'      => $post->id,
                'user_id'      => $user->id,
                'voucher_code' => $voucherCode,
                'status'       => 'claimed',
                'claimed_at'   => now(),
                'expires_at'   => $post->expires_at,
            ]);

            $post->increment('claims_count');

            return ClaimDealDTO::fromModel($claim);
        });
    }
}

