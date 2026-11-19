<?php

namespace App\Modules\Place\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Place\Actions\ClaimBusinessAction;
use App\Modules\Place\Actions\ReviewVerificationAction;
use App\Modules\Place\Actions\SubmitVerificationAction;
use App\Modules\Place\Models\Place;
use App\Modules\Place\Requests\ClaimBusinessRequest;
use App\Modules\Place\Requests\ReviewVerificationRequest;
use App\Modules\Place\Requests\SubmitVerificationRequest;
use App\Modules\Place\Resources\PlaceDetailResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlaceVerificationController extends Controller
{
    /**
     * Submit business legitimacy verification details (TIN, Manager Name, Trade License, Fayda ID)
     * by the existing venue creator/owner.
     */
    public function submit(SubmitVerificationRequest $request, Place $place, SubmitVerificationAction $action): JsonResponse
    {
        $updated = $action->execute($place, $request->user(), $request->validated());

        return response()->json([
            'message' => $updated->is_verified
                ? 'Business verified successfully.'
                : 'Verification submitted successfully and is pending administrator review.',
            'place'   => new PlaceDetailResource($updated),
        ], 200);
    }

    /**
     * Submit a legal business ownership claim for an unclaimed or curator-listed venue.
     * Strictly requires official Ethiopian Trade License (የንግድ ፈቃድ), TIN, and legal manager verification.
     */
    public function claim(ClaimBusinessRequest $request, Place $place, ClaimBusinessAction $action): JsonResponse
    {
        $updated = $action->execute($place, $request->user(), $request->validated());

        return response()->json([
            'message' => 'Your business ownership claim has been submitted successfully. Our administration will review your Trade License and TIN within 24-48 hours.',
            'place'   => new PlaceDetailResource($updated),
        ], 200);
    }

    /**
     * Get the current legitimacy verification status and submitted documents.
     */
    public function status(Request $request, Place $place): JsonResponse
    {
        $user = $request->user();
        $isOwner = (int) $place->user_id === (int) $user->id;
        $isClaimant = (int) $place->claimed_by_id === (int) $user->id;
        $isAdmin = $user->isAdmin() || $user->role === 'admin';

        if (! $isOwner && ! $isClaimant && ! $isAdmin) {
            abort(403, 'You are not authorized to view verification details for this place.');
        }

        return response()->json([
            'place_id'              => $place->id,
            'place_name'            => $place->name,
            'is_verified'           => (bool) $place->is_verified,
            'verification_status'   => $place->verification_status ?? 'unverified',
            'tax_id'                => $place->tax_id,
            'manager_name'          => $place->manager_name,
            'fayda_fin'             => $place->fayda_fin,
            'verification_document' => $this->formatDocumentUrl($place->verification_document),
            'fayda_document'        => $this->formatDocumentUrl($place->fayda_document),
            'telebirr_merchant_id'  => $place->telebirr_merchant_id,
            'verification_notes'    => $place->verification_notes,
            'verified_at'           => $place->verified_at?->toISOString(),
            'fayda_validator_url'   => 'https://id.gov.et/scanId',
            'is_claim'              => (bool) $place->claimed_by_id,
            'claim_role'            => $place->claim_role,
            'claim_contact_phone'   => $place->claim_contact_phone,
            'claim_notes'           => $place->claim_notes,
        ], 200);
    }

    /**
     * List all places pending admin legitimacy verification with optional status filter.
     */
    public function pendingList(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->isAdmin() && $user->role !== 'admin') {
            abort(403, 'Administrator access required.');
        }

        $status = $request->query('status', 'pending');
        if ($status === 'approved') {
            $status = 'verified';
        }

        $query = Place::with(['owner', 'claimant'])->latest('updated_at');

        if ($status !== 'all') {
            $query->where('verification_status', $status);
        } else {
            $query->whereIn('verification_status', ['pending', 'verified', 'rejected']);
        }

        $perPage = max(1, min((int) $request->query('per_page', 15), 50));
        $pendingPlaces = $query->paginate($perPage);

        $counts = [
            'pending'  => Place::where('verification_status', 'pending')->count(),
            'verified' => Place::where('verification_status', 'verified')->count(),
            'rejected' => Place::where('verification_status', 'rejected')->count(),
            'total'    => Place::whereIn('verification_status', ['pending', 'verified', 'rejected'])->count(),
        ];

        $items = $pendingPlaces->getCollection()->map(function (Place $place) {
            return [
                'id'                    => $place->id,
                'name'                  => $place->name,
                'slug'                  => $place->slug,
                'address'               => $place->address,
                'phone'                 => $place->phone,
                'tax_id'                => $place->tax_id,
                'manager_name'          => $place->manager_name,
                'fayda_fin'             => $place->fayda_fin,
                'trade_license_url'     => $this->formatDocumentUrl($place->verification_document),
                'fayda_document_url'    => $this->formatDocumentUrl($place->fayda_document),
                'verification_status'   => $place->verification_status,
                'verification_notes'    => $place->verification_notes,
                'submitted_at'          => $place->updated_at?->toISOString(),
                'verified_at'           => $place->verified_at?->toISOString(),
                'fayda_validator_url'   => 'https://id.gov.et/scanId',
                'is_claim'              => (bool) $place->claimed_by_id,
                'claim_role'            => $place->claim_role,
                'claim_contact_phone'   => $place->claim_contact_phone,
                'claim_notes'           => $place->claim_notes,
                'owner'                 => $place->owner ? [
                    'id'    => $place->owner->id,
                    'name'  => $place->owner->name,
                    'email' => $place->owner->email,
                ] : null,
                'claimant'              => $place->claimant ? [
                    'id'    => $place->claimant->id,
                    'name'  => $place->claimant->name,
                    'email' => $place->claimant->email,
                    'phone' => $place->claim_contact_phone,
                    'role'  => $place->claim_role,
                    'notes' => $place->claim_notes,
                ] : null,
            ];
        })->values();

        return response()->json([
            'data'   => $items,
            'counts' => $counts,
            'meta'   => [
                'current_page' => $pendingPlaces->currentPage(),
                'last_page'    => $pendingPlaces->lastPage(),
                'total'        => $pendingPlaces->total(),
                'per_page'     => $pendingPlaces->perPage(),
            ],
        ], 200);
    }

    /**
     * Admin review action: approve or reject business verification or claim.
     */
    public function review(ReviewVerificationRequest $request, Place $place, ReviewVerificationAction $action): JsonResponse
    {
        $reviewed = $action->execute($place, $request->user(), $request->validated());

        return response()->json([
            'message' => $reviewed->is_verified
                ? 'Place legitimacy verification approved successfully.'
                : 'Place legitimacy verification has been rejected.',
            'place'   => new PlaceDetailResource($reviewed),
        ], 200);
    }

    private function formatDocumentUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return asset('storage/' . ltrim($path, '/'));
    }
}
