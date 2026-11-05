<?php

namespace App\Modules\Review\DTOs;

readonly class CreateReviewDTO
{
    public function __construct(
        public int $rating,
        public ?string $comment = null,
    ) {}
}
