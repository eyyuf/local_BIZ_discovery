<?php

namespace App\Modules\Place\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlaceDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            // TODO: Define resource transformation
        ];
    }
}
