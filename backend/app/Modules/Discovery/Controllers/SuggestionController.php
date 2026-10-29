<?php

namespace App\Modules\Discovery\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Discovery\Actions\GetSearchSuggestionsAction;
use App\Modules\Discovery\Requests\SuggestionRequest;
use Illuminate\Http\JsonResponse;

class SuggestionController extends Controller
{
    public function index(SuggestionRequest $request, GetSearchSuggestionsAction $action): JsonResponse
    {
        // TODO: Return search typeahead suggestions
    }
}
