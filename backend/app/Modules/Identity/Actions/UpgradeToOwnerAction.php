<?php

namespace App\Modules\Identity\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use Illuminate\Support\Str;

class UpgradeToOwnerAction
{
    public function execute(User $user, array $data): array
    {
        $user->update([
            'role' => 'owner',
        ]);

        $place = Place::create([
            'user_id'     => $user->id,
            'name'        => $data['business_name'],
            'slug'        => Str::slug($data['business_name'] . '-' . Str::random(5)),
            'description' => $data['description'] ?? null,
            'address'     => $data['address'],
            'phone'       => $data['phone'] ?? null,
            'website'     => $data['website'] ?? null,
            'is_active'   => true,
        ]);

        return [
            'user'  => $user->fresh(),
            'place' => $place,
        ];
    }
}
