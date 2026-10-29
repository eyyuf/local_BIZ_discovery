<?php

namespace App\Modules\Place\Actions;
use Illuminate\Support\Str;
use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;

class CreatePlaceAction
{
    public function execute(User $user, array $data): Place
    {
        $data['user_id']=$user->id;
        $data['slug']=Str::slug($data['name']) . '-' .
        Str::lower(Str::random(8));

        return Place::create($data);
    }
}
