<?php

namespace App\Modules\Social\DTOs;

use Carbon\Carbon;

readonly class CreatePostDTO
{
    public function __construct(
        public string $title,
        public string $content,
        public string $dealType = 'deal',
        public ?float $discountPercentage = null,
        public ?string $discountCode = null,
        public ?string $imageUrl = null,
        public ?int $maxClaims = null,
        public ?Carbon $expiresAt = null,
    ) {}
}
