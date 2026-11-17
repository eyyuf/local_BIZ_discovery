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
        if ((int) $place->user_id !== (int) $user->id && ! $user->isAdmin()) {
            abort(403, 'You are not authorized to verify this place.');
        }

        $type = $data['verification_type'] ?? 'tin_fayda';

        // 1. Instant Telebirr Merchant Verification (Automated flow)
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
                'verification_notes'   => 'Verified instantly via Telebirr Merchant Till',
            ]);

            return $place->fresh();
        }

        // 2. Comprehensive Ethiopian TIN + Fayda National ID + Trade License Verification
        // Extract & Validate TIN
        $taxId = trim((string) ($data['tax_id'] ?? $place->tax_id ?? ''));
        if (empty($taxId)) {
            throw ValidationException::withMessages([
                'tax_id' => ['The 10-digit Taxpayer Identification Number (TIN / የግብር ከፋይ መለያ ቁጥር) is required.'],
            ]);
        }
        if (! preg_match('/^\d{9,12}$/', $taxId)) {
            throw ValidationException::withMessages([
                'tax_id' => ['The TIN number must be a valid 10-digit number.'],
            ]);
        }

        // Extract & Validate General Manager Name
        $managerName = trim((string) ($data['manager_name'] ?? $place->manager_name ?? ''));
        if (empty($managerName)) {
            throw ValidationException::withMessages([
                'manager_name' => ['The legal General Manager name (as stated on Trade License & Fayda ID) is required.'],
            ]);
        }

        // Extract Fayda FIN (FAN / FIN)
        $faydaFin = isset($data['fayda_fin']) && trim((string) $data['fayda_fin']) !== ''
            ? trim((string) $data['fayda_fin'])
            : $place->fayda_fin;

        // Resolve Trade License Document (file upload or URL)
        $licensePath = $this->resolveDocument(
            $data,
            ['license_document', 'verification_document'],
            ['license_document_url', 'verification_document_url'],
            $place->verification_document,
            'verifications/licenses'
        );

        if (empty($licensePath)) {
            throw ValidationException::withMessages([
                'license_document' => ['A photo or scanned copy of your Trade License (የንግድ ፈቃድ) is required.'],
            ]);
        }

        // Resolve Fayda National ID Document (file upload or URL)
        $faydaPath = $this->resolveDocument(
            $data,
            ['fayda_document', 'fayda_id'],
            ['fayda_document_url'],
            $place->fayda_document,
            'verifications/fayda'
        );

        $place->update([
            'tax_id'                => $taxId,
            'manager_name'          => $managerName,
            'fayda_fin'             => $faydaFin,
            'verification_document' => $licensePath,
            'fayda_document'        => $faydaPath,
            'verification_status'   => 'pending',
            'is_verified'           => false,
            'verification_notes'    => 'Verification submitted with Trade License and Fayda ID. Pending administrator review.',
        ]);

        return $place->fresh();
    }

    private function resolveDocument(
        array $data,
        array $fileKeys,
        array $urlKeys,
        ?string $existingPath,
        string $folder
    ): ?string {
        foreach ($fileKeys as $key) {
            if (isset($data[$key]) && $data[$key] instanceof UploadedFile) {
                return $this->storeUploadedFile($data[$key], $folder);
            }
        }

        foreach ($urlKeys as $key) {
            if (!empty($data[$key]) && is_string($data[$key])) {
                return $data[$key];
            }
        }

        return $existingPath;
    }

    private function storeUploadedFile(UploadedFile $file, string $folder): string
    {
        try {
            if (config('filesystems.disks.cloudinary.key') || env('CLOUDINARY_URL')) {
                $path = $file->store("local_biz/{$folder}", 'cloudinary');
                return Storage::disk('cloudinary')->url($path);
            }
        } catch (\Throwable) {
            // fallback to public disk
        }

        $path = $file->store($folder, 'public');
        return Storage::disk('public')->url($path);
    }
}
