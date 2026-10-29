<?php

namespace App\Modules\Place\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuSectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'place_id'      => $this->place_id,
            'name'          => $this->name,
            'display_order' => $this->display_order,
            'items'         => MenuItemResource::collection(
                $this->whenLoaded('items')
            ),
            'created_at'    => $this->created_at,
            'updated_at'    => $this->updated_at,
        ];
    }
}
