<?php

namespace App\Modules\Place\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Place\Models\Place;
use App\Modules\Place\Models\PlaceImage;
use App\Modules\Place\Resources\PlaceImageResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class PlaceImageController extends Controller
{
    /**
     * List all images for a given place.
     */
    public function index(Place $place): JsonResponse
    {
        $images = $place->images()->orderBy('display_order')->orderBy('id')->get();

        return response()->json([
            'message' => 'Images retrieved successfully',
            'data'    => PlaceImageResource::collection($images),
        ], 200);
    }

    /**
     * Upload and attach an image to a place via Cloudinary.
     */
    public function store(Request $request, Place $place): JsonResponse
    {
        Gate::authorize('update', $place);

        $request->validate([
            'image'         => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'], // 5MB max
            'image_url'     => ['nullable', 'string', 'url', 'max:2048'],
            'is_cover'      => ['nullable', 'boolean'],
            'display_order' => ['nullable', 'integer', 'min:0'],
        ]);

        if (!$request->hasFile('image') && !$request->filled('image_url')) {
            return response()->json([
                'message' => 'Either an image file or an image_url must be provided.',
                'errors'  => ['image' => ['The image field is required when image_url is missing.']],
            ], 422);
        }

        $imagePath = '';

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('local_biz/places', 'cloudinary');
            $imagePath = Storage::disk('cloudinary')->url($path);
        } else {
            $imagePath = $request->input('image_url');
        }

        $isCover = $request->boolean('is_cover');

        // If this is set as cover, unset all other covers for this place
        if ($isCover) {
            $place->images()->update(['is_cover' => false]);
        } else {
            // If the place has no images yet, make this first one cover automatically
            if ($place->images()->count() === 0) {
                $isCover = true;
            }
        }

        $displayOrder = $request->input('display_order');
        if ($displayOrder === null) {
            $displayOrder = ($place->images()->max('display_order') ?? -1) + 1;
        }

        $placeImage = $place->images()->create([
            'image_path'    => $imagePath,
            'is_cover'      => $isCover,
            'display_order' => (int) $displayOrder,
        ]);

        return response()->json([
            'message' => 'Place image uploaded successfully',
            'data'    => new PlaceImageResource($placeImage),
        ], 201);
    }

    /**
     * Designate an existing image as the cover image.
     */
    public function setCover(Place $place, PlaceImage $placeImage): JsonResponse
    {
        Gate::authorize('update', $place);

        if ($placeImage->place_id !== $place->id) {
            abort(404, 'Image does not belong to this place.');
        }

        $place->images()->update(['is_cover' => false]);
        $placeImage->update(['is_cover' => true]);

        return response()->json([
            'message' => 'Cover image updated successfully',
            'data'    => new PlaceImageResource($placeImage->fresh()),
        ], 200);
    }

    /**
     * Delete an image from database and Cloudinary storage.
     */
    public function destroy(Place $place, PlaceImage $placeImage): JsonResponse
    {
        Gate::authorize('update', $place);

        if ($placeImage->place_id !== $place->id) {
            abort(404, 'Image does not belong to this place.');
        }

        $wasCover = $placeImage->is_cover;

        // Attempt deletion from Cloudinary if stored as relative path
        if (!empty($placeImage->image_path) && !str_starts_with($placeImage->image_path, 'http')) {
            try {
                Storage::disk('cloudinary')->delete($placeImage->image_path);
            } catch (\Throwable) {
                // Ignore storage delete errors
            }
        }

        $placeImage->delete();

        // If the deleted image was cover, promote the next image
        if ($wasCover) {
            $next = $place->images()->orderBy('display_order')->first();
            $next?->update(['is_cover' => true]);
        }

        return response()->json([
            'message' => 'Place image deleted successfully',
        ], 200);
    }
}

