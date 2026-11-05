<?php

namespace App\Modules\Social\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Contracts\PlaceQueryInterface;
use App\Modules\Place\Models\Place;
use App\Modules\Social\DTOs\CreatePostDTO;
use App\Modules\Social\Models\Post;
use Illuminate\Validation\ValidationException;

class PublishDealAction
{
    public function __construct(
        private ?PlaceQueryInterface $placeQuery = null
    ) {}

    public function execute(Place $place, User $author, CreatePostDTO|array $data): Post
    {
        $dto = $data instanceof CreatePostDTO ? $data : CreatePostDTO::fromArray($data);

        if ($this->placeQuery && !$this->placeQuery->isPlaceOpen($place->id)) {
            throw ValidationException::withMessages([
                'place' => ['Cannot publish deals for an inactive or closed place.'],
            ]);
        }

        $payload = array_merge($dto->toArray(), [
            'place_id'    => $place->id,
            'user_id'     => $author->id,
            'is_active'   => true,
            'likes_count' => 0,
        ]);

        return Post::create($payload);
    }
}
