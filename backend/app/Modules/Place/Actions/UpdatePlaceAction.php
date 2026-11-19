<?php

namespace App\Modules\Place\Actions;

use App\Modules\Place\DTOs\UpdatePlaceDTO;
use App\Modules\Place\Models\Place;
use Illuminate\Support\Str;

class UpdatePlaceAction
{
    public function execute(Place $place, UpdatePlaceDTO|array $data): Place
    {
        $dto = $data instanceof UpdatePlaceDTO ? $data : UpdatePlaceDTO::fromArray($data);
        $payload = $dto->toArray();

        if (! empty($dto->name) && $dto->name !== $place->name) {
            $payload['slug'] = Str::slug($dto->name) . '-' . Str::lower(Str::random(8));
        }

        $place->update($payload);

        return $place;
    }
}
