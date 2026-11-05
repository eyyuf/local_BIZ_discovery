<?php

namespace App\Modules\Review\DTOs;

readonly class ReviewSummaryDTO
{
    public function __construct(
        public float $averageRating,
        public int $totalReviews,
    ) {}
}
