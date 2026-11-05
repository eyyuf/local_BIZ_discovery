<?php

namespace App\Modules\Review\DTOs;

readonly class CreateResponseDTO
{
    public function __construct(
        public string $response,
    ) {}
}
