<?php

namespace App\Modules\Place\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ClaimBusinessAction
{
    public function execute(Place $place, User $user, array $data): Place
    {
        // 1. Prevent claiming an already verified business
        if ($place->is_verified) {
            throw ValidationException::withMessages([
                'place' => ['This business is already officially verified and claimed by its verified owner.'],
            ]);
        }

        // 2. Prevent duplicate claims while one is under review
        if ($place->verification_status === 'pending') {
            throw ValidationException::withMessages([
                'verification' => ['A verification claim for this venue is currently pending administrator review.'],
            ]);
        }

        // 3. Resolve Trade License Document
        $licensePath = $this->resolveDocument(
            $data,
            ['license_document', 'verification_document'],
            ['license_document_url', 'verification_document_url'],
            null,
            'verifications/licenses'
        );

        if (empty($licensePath)) {
            throw ValidationException::withMessages([
                'license_document' => ['A photo or scanned copy of your Trade License (የንግድ ፈቃድ) is required to claim this business.'],
            ]);
        }

        // 4. Resolve Fayda National ID Document (Optional but recommended)
        $faydaPath = $this->resolveDocument(
            $data,
            ['fayda_document', 'fayda_id'],
            ['fayda_document_url'],
            null,
            'verifications/fayda'
        );

        $taxId = trim((string) ($data['tax_id'] ?? ''));
        $managerName = trim((string) ($data['manager_name'] ?? ''));
        $faydaFin = isset($data['fayda_fin']) && trim((string) $data['fayda_fin']) !== ''
            ? trim((string) $data['fayda_fin'])
            : null;
        $telebirrMerchantId = isset($data['telebirr_merchant_id']) && trim((string) $data['telebirr_merchant_id']) !== ''
            ? trim((string) $data['telebirr_merchant_id'])
            : null;

        $roleLabel = match ($data['claim_role'] ?? 'owner') {
            'owner' => 'Owner / Founder',
            'general_manager' => 'General Manager',
            'managing_partner' => 'Managing Partner',
            'authorized_agent' => 'Authorized Representative',
            default => 'Owner',
        };

        $place->update([
            'claimed_by_id'         => $user->id,
            'claim_role'            => $data['claim_role'] ?? 'owner',
            'claim_contact_phone'   => $data['claim_contact_phone'] ?? null,
            'claim_notes'           => $data['claim_notes'] ?? null,
            'tax_id'                => $taxId,
            'manager_name'          => $managerName,
            'fayda_fin'             => $faydaFin,
            'telebirr_merchant_id'  => $telebirrMerchantId,
            'verification_document' => $licensePath,
            'fayda_document'        => $faydaPath,
            'verification_status'   => 'pending',
            'is_verified'           => false,
            'verification_notes'    => "Ownership claim submitted by {$user->name} ({$user->email}) as {$roleLabel}. Pending administrator review.",
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
