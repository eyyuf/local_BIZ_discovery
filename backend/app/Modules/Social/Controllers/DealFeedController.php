<?php

namespace App\Modules\Social\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Place\Models\Place;
use App\Modules\Social\Models\Post;
use App\Modules\Social\Resources\PostResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DealFeedController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Post::query()
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->with(['place', 'author']);

        if ($request->has('deal_type')) {
            $query->where('deal_type', $request->query('deal_type'));
        }

        $posts = $query->latest()->paginate((int) $request->query('per_page', 15));

        return response()->json([
            'message' => 'Deals feed retrieved successfully',
            'data'    => PostResource::collection($posts),
        ], 200);
    }

    public function placeDeals(Place $place): JsonResponse
    {
        $posts = $place->posts()
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->with(['place', 'author'])
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Place deals retrieved successfully',
            'data'    => PostResource::collection($posts),
        ], 200);
    }
}
