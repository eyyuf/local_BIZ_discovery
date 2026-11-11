<?php

namespace App\Modules\Place\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Place\DTOs\CreatePlaceDTO;
use App\Modules\Place\Models\Place;
use Illuminate\Support\Str;

class CreatePlaceAction
{
    public function execute(User $user, CreatePlaceDTO|array $data): Place
    {
        $dto = $data instanceof CreatePlaceDTO ? $data : CreatePlaceDTO::fromArray($data);
        $payload = $dto->toArray();

        $payload['user_id'] = $user->id;
        $payload['slug'] = Str::slug($dto->name) . '-' . Str::lower(Str::random(8));

        return Place::create($payload);
    }
}
