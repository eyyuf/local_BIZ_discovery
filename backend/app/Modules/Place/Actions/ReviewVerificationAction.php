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

        // Prevent owners from approving their own businesses
        if ((int) $place->user_id === (int) $adminUser->id) {
            abort(403, 'Administrators cannot approve or review their own businesses.');
        }

        $decision = $data['decision'] ?? null;
        $notes = isset($data['notes']) ? trim((string) $data['notes']) : null;

        if ($decision === 'approved') {
            $place->update([
                'is_verified'         => true,
                'verification_status' => 'verified',
                'verified_at'         => now(),
                'verification_notes'  => $notes ?: 'Approved by administrator after verifying Trade License and Fayda ID.',
            ]);
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
            ]);
        }

        return $place->fresh();
    }
}
