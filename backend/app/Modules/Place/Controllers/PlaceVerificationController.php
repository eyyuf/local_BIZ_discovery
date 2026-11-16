<?php

namespace App\Modules\Place\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Place\Actions\ReviewVerificationAction;
use App\Modules\Place\Actions\SubmitVerificationAction;
use App\Modules\Place\Models\Place;
use App\Modules\Place\Requests\ReviewVerificationRequest;
use App\Modules\Place\Requests\SubmitVerificationRequest;
use App\Modules\Place\Resources\PlaceDetailResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PlaceVerificationController extends Controller
{
    public function submit(SubmitVerificationRequest $request, Place $place, SubmitVerificationAction $action): JsonResponse
    {
        $updated = $action->execute($place, $request->user(), $request->validated());

        return response()->json([
            'message' => $updated->is_verified ? 'Business verified successfully' : 'Verification submitted and pending review',
            'place'   => new PlaceDetailResource($updated),
        ], 200);
    }

    public function status(Request $request, Place $place): JsonResponse
    {
        if ((int) $place->user_id !== (int) $request->user()->id && ! $request->user()->isAdmin() && $request->user()->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        return response()->json([
            'place_id'              => $place->id,
            'is_verified'           => (bool) $place->is_verified,
            'verification_status'   => $place->verification_status ?? 'unverified',
            'verified_at'           => $place->verified_at?->toISOString(),
            'telebirr_merchant_id'  => $place->telebirr_merchant_id,
            'tax_id'                => $place->tax_id,
            'verification_document' => $place->verification_document
                ? (str_starts_with($place->verification_document, 'http')
                    ? $place->verification_document
                    : asset('storage/' . $place->verification_document))
                : null,
            'verification_notes'    => $place->verification_notes,
        ]);
    }

    public function pendingList(Request $request): AnonymousResourceCollection
    {
        if (! $request->user()->isAdmin() && $request->user()->role !== 'admin') {
            abort(403, 'Administrator access required.');
        }

        $pendingPlaces = Place::where('verification_status', 'pending')->latest()->paginate(15);

        return PlaceDetailResource::collection($pendingPlaces);
    }

    public function review(ReviewVerificationRequest $request, Place $place, ReviewVerificationAction $action): JsonResponse
    {
        $reviewed = $action->execute($place, $request->user(), $request->validated());

        return response()->json([
            'message' => $reviewed->is_verified ? 'Place verification approved' : 'Place verification rejected',
            'place'   => new PlaceDetailResource($reviewed),
        ], 200);
    }
}
