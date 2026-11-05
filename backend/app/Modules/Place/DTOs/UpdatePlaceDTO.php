<?php

namespace App\Modules\Place\DTOs;

use App\Modules\Place\Requests\UpdatePlaceRequest;

readonly class UpdatePlaceDTO
{
    public function __construct(
        public ?string $name = null,
        public ?string $address = null,
        public ?string $phone = null,
        public ?string $description = null,
        public ?string $website = null,
        public ?float $latitude = null,
        public ?float $longitude = null,
        public ?bool $isActive = null,
    ) {}

    public static function fromRequest(UpdatePlaceRequest $request): self
    {
        return new self(
            name: $request->has('name') ? (string) $request->validated('name') : null,
            address: $request->has('address') ? (string) $request->validated('address') : null,
            phone: $request->has('phone') ? (string) $request->validated('phone') : null,
            description: $request->has('description') ? $request->validated('description') : null,
            website: $request->has('website') ? $request->validated('website') : null,
            latitude: $request->has('latitude') && $request->validated('latitude') !== null ? (float) $request->validated('latitude') : null,
            longitude: $request->has('longitude') && $request->validated('longitude') !== null ? (float) $request->validated('longitude') : null,
            isActive: $request->has('is_active') ? (bool) $request->validated('is_active') : null,
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'] ?? null,
            address: $data['address'] ?? null,
            phone: $data['phone'] ?? null,
            description: $data['description'] ?? null,
            website: $data['website'] ?? null,
            latitude: isset($data['latitude']) && $data['latitude'] !== null ? (float) $data['latitude'] : null,
            longitude: isset($data['longitude']) && $data['longitude'] !== null ? (float) $data['longitude'] : null,
            isActive: isset($data['is_active']) ? (bool) $data['is_active'] : null,
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

