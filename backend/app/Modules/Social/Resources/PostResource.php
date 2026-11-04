<?php

namespace App\Modules\Social\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            // TODO: Transform post attributes and relations
        ];
    }
}
