<?php

namespace App\Modules\Place\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class SubmitVerificationAction
{
    public function execute(Place $place, User $user, array $data): Place
    {
        if ((int) $place->user_id !== (int) $user->id) {
            abort(403, 'You are not authorized to verify this place.');
        }

        $type = $data['verification_type'] ?? null;

        if ($type === 'telebirr') {
            $merchantId = trim((string) ($data['telebirr_merchant_id'] ?? ''));

            if (! preg_match('/^\d{5,8}$/', $merchantId)) {
                throw ValidationException::withMessages([
                    'telebirr_merchant_id' => ['The Telebirr Merchant ID must be a valid 5 to 8 digit number.'],
                ]);
            }

            $place->update([
                'telebirr_merchant_id' => $merchantId,
                'verification_status'  => 'verified',
                'is_verified'          => true,
                'verified_at'          => now(),
                'verification_notes'   => 'Verified via Telebirr Merchant Till',
            ]);

            return $place->fresh();
        }

        if ($type === 'document') {
            $path = null;

            if (isset($data['document']) && $data['document'] instanceof UploadedFile) {
                try {
                    $path = Storage::disk('cloudinary')->putFile('local_biz/verifications', $data['document']);
                } catch (\Throwable) {
                    $path = $data['document']->store('verifications', 'public');
                }
            }

            $place->update([
                'verification_document' => $path,
                'verification_status'   => 'pending',
                'is_verified'           => false,
                'verification_notes'    => 'Pending document review',
            ]);

            return $place->fresh();
        }

        if ($type === 'tin') {
            $taxId = trim((string) ($data['tax_id'] ?? ''));

            if (! preg_match('/^\d{9,12}$/', $taxId)) {
                throw ValidationException::withMessages([
                    'tax_id' => ['The TIN number must be a valid 10-digit tax identification number.'],
                ]);
            }

            $place->update([
                'tax_id'              => $taxId,
                'verification_status' => 'pending',
                'is_verified'         => false,
                'verification_notes'  => 'Pending TIN verification',
            ]);

            return $place->fresh();
        }

        throw ValidationException::withMessages([
            'verification_type' => ['Invalid verification type provided.'],
        ]);
    }
}
