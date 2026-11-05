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

    public function execute(Place $place, User $author, CreatePostDTO $dto): Post
    {
        
        if ($this->placeQuery && ! $this->placeQuery->isPlaceOpen($place->id)) {
            throw ValidationException::withMessages([
                'place' => ['Cannot publish deals for an inactive or closed place.'],
            ]);
        }

        return Post::create([
            'place_id'            => $place->id,
            'user_id'             => $author->id,
            'title'               => $dto->title,
            'content'             => $dto->content,
            'deal_type'           => $dto->dealType,
            'discount_percentage' => $dto->discountPercentage,
            'discount_code'       => $dto->discountCode,
            'image_url'           => $dto->imageUrl,
            'max_claims'          => $dto->maxClaims,
            'expires_at'          => $dto->expiresAt,
            'is_active'           => true,
            'likes_count'         => 0,
        ]);
    }
}
