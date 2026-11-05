<?php

namespace App\Modules\Discovery\DTOs;

use App\Modules\Discovery\Requests\SuggestionRequest;

readonly class SuggestionQueryDTO
{
    public function __construct(
        public string $query,
        public int $limit = 5,
    ) {}

    public static function fromRequest(SuggestionRequest $request): self
    {
        return new self(
            query: (string) $request->validated('q'),
            limit: (int) $request->validated('limit', 5),
        );
    }
}

