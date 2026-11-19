<?php

namespace App\Modules\Place\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use Illuminate\Validation\ValidationException;

class ReviewVerificationAction
{
    public function execute(Place $place, User $adminUser, array $data): Place
    {
        if (! $adminUser->isAdmin() && $adminUser->role !== 'admin') {
            abort(403, 'Administrator access required.');
        }

        // Prevent owners from approving their own claims or businesses
        if ((int) $place->claimed_by_id === (int) $adminUser->id ||
            ((int) $place->user_id === (int) $adminUser->id && empty($place->claimed_by_id))) {
            abort(403, 'Administrators cannot approve or review their own businesses or claims.');
        }

        $decision = $data['decision'] ?? null;
        $notes = isset($data['notes']) ? trim((string) $data['notes']) : null;

        if ($decision === 'approved') {
            $updateData = [
                'is_verified'         => true,
                'verification_status' => 'verified',
                'verified_at'         => now(),
                'verification_notes'  => $notes ?: 'Approved by administrator after verifying Trade License and official documentation.',
            ];

            // If this was a business claim, transfer venue ownership to the claimant and promote role
            if ($place->claimed_by_id) {
                $claimant = User::find($place->claimed_by_id);
                if ($claimant) {
                    $updateData['user_id'] = $claimant->id;

                    // Automatically upgrade regular users to business owners
                    if ($claimant->role === 'user') {
                        $claimant->update(['role' => 'owner']);
                    }
                }
                $updateData['claimed_by_id'] = null;
            }

            $place->update($updateData);
        } else {
            if (empty($notes)) {
                throw ValidationException::withMessages([
                    'notes' => ['A meaningful rejection reason is required when rejecting verification.'],
                ]);
            }

            $place->update([
                'is_verified'         => false,
                'verification_status' => 'rejected',
                'verified_at'         => null,
                'verification_notes'  => $notes,
                'claimed_by_id'       => null, // Reset claim so legitimate owner can re-apply
            ]);
        }

        return $place->fresh();
    }
}
