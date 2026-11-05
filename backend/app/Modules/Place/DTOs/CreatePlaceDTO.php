<?php

namespace App\Modules\Place\DTOs;

use App\Modules\Place\Requests\StorePlaceRequest;

readonly class CreatePlaceDTO
{
    public function __construct(
        public string $name,
        public string $address,
        public string $phone,
        public ?string $description = null,
        public ?string $website = null,
        public ?float $latitude = null,
        public ?float $longitude = null,
        public bool $isActive = true,
    ) {}

    public static function fromRequest(StorePlaceRequest $request): self
    {
        return new self(
            name: (string) $request->validated('name'),
            address: (string) $request->validated('address'),
            phone: (string) $request->validated('phone'),
            description: $request->validated('description'),
            website: $request->validated('website'),
            latitude: $request->validated('latitude') !== null ? (float) $request->validated('latitude') : null,
            longitude: $request->validated('longitude') !== null ? (float) $request->validated('longitude') : null,
            isActive: (bool) $request->validated('is_active', true),
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            name: (string) ($data['name'] ?? ''),
            address: (string) ($data['address'] ?? ''),
            phone: (string) ($data['phone'] ?? ''),
            description: $data['description'] ?? null,
            website: $data['website'] ?? null,
            latitude: isset($data['latitude']) && $data['latitude'] !== null ? (float) $data['latitude'] : null,
            longitude: isset($data['longitude']) && $data['longitude'] !== null ? (float) $data['longitude'] : null,
            isActive: (bool) ($data['is_active'] ?? true),
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'name'        => $this->name,
            'address'     => $this->address,
            'phone'       => $this->phone,
            'description' => $this->description,
            'website'     => $this->website,
            'latitude'    => $this->latitude,
            'longitude'   => $this->longitude,
            'is_active'   => $this->isActive,
        ], fn ($val) => $val !== null);
    }
}

