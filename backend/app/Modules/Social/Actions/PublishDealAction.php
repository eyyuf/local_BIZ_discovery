<?php

namespace App\Modules\Social\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Contracts\PlaceQueryInterface;
use App\Modules\Place\Models\Place;
use App\Modules\Social\DTOs\CreatePostDTO;
use App\Modules\Social\Models\Post;

class PublishDealAction
{
    public function __construct(
        private ?PlaceQueryInterface $placeQuery = null
    ) {}

    /**
     * Execute publishing a deal post.
     */
    public function execute(Place $place, User $author, CreatePostDTO|array $data): Post
    {
        // TODO: Implement deal and announcement publishing logic
    }
}
