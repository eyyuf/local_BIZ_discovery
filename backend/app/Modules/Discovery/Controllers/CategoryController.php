<?php

namespace App\Modules\Discovery\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Discovery\Actions\GetCategoryPlacesAction;
use App\Modules\Discovery\Models\Category;
use App\Modules\Discovery\Requests\CategoryPlacesRequest;
use App\Modules\Discovery\Resources\CategoryResource;
use App\Modules\Discovery\Resources\SearchResultResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    /**
     * Display a listing of active root categories with their active children.
     */
    public function index(): JsonResponse
    {
        $categories = Cache::rememberForever('all_categories', function () {
            return Category::query()
                ->whereNull('parent_id')
                ->where('is_active', true)
                ->with(['children' => fn ($query) => $query->where('is_active', true)])
                ->get();
        });

        return CategoryResource::collection($categories)->response();
    }

    /**
     * Display category details and its paginated places (including active subcategories).
     */
    public function show(
        CategoryPlacesRequest $request,
        Category $category,
        GetCategoryPlacesAction $action
    ): JsonResponse {
        if (! $category->is_active) {
            abort(404);
        }

        $perPage = (int) ($request->validated('per_page') ?? 15);
        $places = $action->execute($category, $perPage);

        return response()->json([
            'category' => new CategoryResource($category),
            'places'   => SearchResultResource::collection($places)->response()->getData(true),
        ], 200);
    }
}
