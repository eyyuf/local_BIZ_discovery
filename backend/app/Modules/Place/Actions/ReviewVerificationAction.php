<?php

namespace App\Modules\Place\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;

class ReviewVerificationAction
{
    public function execute(Place $place, User $adminUser, array $data): Place
    {
        if (! $adminUser->isAdmin() && $adminUser->role !== 'admin') {
            abort(403, 'Administrator access required.');
        }

        $decision = $data['decision'] ?? null;
        $notes = $data['notes'] ?? null;

        if ($decision === 'approved') {
            $place->update([
                'is_verified'         => true,
                'verification_status' => 'verified',
                'verified_at'         => now(),
                'verification_notes'  => $notes ?: 'Approved by administrator',
            ]);
        } else {
            $place->update([
                'is_verified'         => false,
                'verification_status' => 'rejected',
                'verified_at'         => null,
                'verification_notes'  => $notes ?: 'Rejected by administrator',
            ]);
        }

        return $place->fresh();
    }
}
