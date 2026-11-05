<?php

namespace App\Modules\Place\DTOs;

use App\Modules\Place\Models\Place;

readonly class PlaceSummaryDTO
{
    public function __construct(
        public int $id,
        public int $userId,
        public string $name,
        public string $slug,
        public string $address,
        public ?string $description = null,
        public ?string $phone = null,
        public ?string $website = null,
        public ?float $latitude = null,
        public ?float $longitude = null,
        public bool $isActive = true,
    ) {}

    public static function fromModel(Place $place): self
    {
        return new self(
            id: (int) $place->id,
            userId: (int) $place->user_id,
            name: $place->name,
            slug: $place->slug,
            address: $place->address,
            description: $place->description,
            phone: $place->phone,
            website: $place->website,
            latitude: $place->latitude !== null ? (float) $place->latitude : null,
            longitude: $place->longitude !== null ? (float) $place->longitude : null,
            isActive: (bool) $place->is_active,
        );
    }
}

