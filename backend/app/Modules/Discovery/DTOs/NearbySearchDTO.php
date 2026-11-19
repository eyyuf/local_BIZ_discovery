<?php

namespace App\Modules\Discovery\DTOs;

use App\Modules\Discovery\Requests\NearbyPlacesRequest;

readonly class NearbySearchDTO
{
    public function __construct(
        public float $lat,
        public float $lng,
        public float $radiusKm = 5.0,
        public int $limit = 20,
    ) {}

    public static function fromRequest(NearbyPlacesRequest $request): self
    {
        return new self(
            lat: (float) $request->validated('lat'),
            lng: (float) $request->validated('lng'),
            radiusKm: (float) $request->validated('radius', 5.0),
            limit: (int) $request->validated('limit', 20),
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            lat: (float) ($data['lat'] ?? 0.0),
            lng: (float) ($data['lng'] ?? 0.0),
            radiusKm: (float) ($data['radius'] ?? $data['radiusKm'] ?? 5.0),
            limit: (int) ($data['limit'] ?? 20),
        );
    }
}

