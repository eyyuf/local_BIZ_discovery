<?php

namespace App\Modules\Social\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use App\Modules\Social\Models\Post;

class PublishDealAction
{
    public function execute(Place $place, User $author, array $data): Post
    {
        // TODO: Implement deal and announcement publishing logic
    }
}
