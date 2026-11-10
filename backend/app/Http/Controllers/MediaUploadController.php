<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaUploadController extends Controller
{
    /**
     * Upload an image to Cloudinary in the local_biz folder.
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image'  => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'], // 5MB max
            'folder' => ['nullable', 'string', 'in:places,menus,reviews,general'],
        ]);

        $subfolder = $request->input('folder', 'general');
        $directory = 'local_biz/' . $subfolder;

        $path = $request->file('image')->store($directory, 'cloudinary');
        $url = Storage::disk('cloudinary')->url($path);

        return response()->json([
            'message' => 'Image uploaded successfully',
            'url'     => $url,
            'path'    => $path,
        ], 201);
    }
}
