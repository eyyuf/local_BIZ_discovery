<?php

namespace App\Modules\Discovery\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Discovery\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        // TODO: Return list of all active categories
    }

    public function show(Category $category): JsonResponse
    {
        // TODO: Return category details with places
    }
}
