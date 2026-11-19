<?php

namespace App\Modules\Discovery\DTOs;

use App\Modules\Discovery\Requests\SearchPlacesRequest;

readonly class SearchFilterDTO
{
    public function __construct(
        public ?string $query = null,
        public ?string $category = null,
        public ?float $lat = null,
        public ?float $lng = null,
        public ?float $radius = null,
        public bool $openNow = false,
        public string $sortBy = 'distance',
        public int $page = 1,
        public int $perPage = 20,
    ) {}

    public static function fromRequest(SearchPlacesRequest $request): self
    {
        return new self(
            query: $request->validated('q'),
            category: $request->validated('category'),
            lat: $request->validated('lat') !== null ? (float) $request->validated('lat') : null,
            lng: $request->validated('lng') !== null ? (float) $request->validated('lng') : null,
            radius: $request->validated('radius') !== null ? (float) $request->validated('radius') : null,
            openNow: (bool) $request->boolean('open_now', false),
            sortBy: (string) $request->validated('sort_by', 'distance'),
            page: (int) $request->validated('page', 1),
            perPage: (int) $request->validated('per_page', 20),
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            query: $data['q'] ?? null,
            category: $data['category'] ?? null,
            lat: isset($data['lat']) && $data['lat'] !== null ? (float) $data['lat'] : null,
            lng: isset($data['lng']) && $data['lng'] !== null ? (float) $data['lng'] : null,
            radius: isset($data['radius']) && $data['radius'] !== null ? (float) $data['radius'] : null,
            openNow: (bool) ($data['open_now'] ?? false),
            sortBy: (string) ($data['sort_by'] ?? 'distance'),
            page: (int) ($data['page'] ?? 1),
            perPage: (int) ($data['per_page'] ?? 20),
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'q'        => $this->query,
            'category' => $this->category,
            'lat'      => $this->lat,
            'lng'      => $this->lng,
            'radius'   => $this->radius,
            'open_now' => $this->openNow,
            'sort_by'  => $this->sortBy,
            'page'     => $this->page,
            'per_page' => $this->perPage,
        ], fn ($val) => $val !== null);
    }
}

