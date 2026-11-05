<?php

namespace App\Modules\Social\DTOs;

use App\Modules\Social\Requests\StorePostRequest;
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

    public static function fromRequest(StorePostRequest $request): self
    {
        return new self(
            title: (string) $request->validated('title'),
            content: (string) $request->validated('content'),
            dealType: (string) $request->validated('deal_type', 'deal'),
            discountPercentage: $request->validated('discount_percentage') !== null ? (float) $request->validated('discount_percentage') : null,
            discountCode: $request->validated('discount_code'),
            imageUrl: $request->validated('image_url'),
            maxClaims: $request->validated('max_claims') !== null ? (int) $request->validated('max_claims') : null,
            expiresAt: $request->validated('expires_at') ? Carbon::parse($request->validated('expires_at')) : null,
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            title: (string) ($data['title'] ?? ''),
            content: (string) ($data['content'] ?? ''),
            dealType: (string) ($data['deal_type'] ?? 'deal'),
            discountPercentage: isset($data['discount_percentage']) && $data['discount_percentage'] !== null ? (float) $data['discount_percentage'] : null,
            discountCode: $data['discount_code'] ?? null,
            imageUrl: $data['image_url'] ?? null,
            maxClaims: isset($data['max_claims']) && $data['max_claims'] !== null ? (int) $data['max_claims'] : null,
            expiresAt: isset($data['expires_at']) && $data['expires_at'] ? Carbon::parse($data['expires_at']) : null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'title'               => $this->title,
            'content'             => $this->content,
            'deal_type'           => $this->dealType,
            'discount_percentage' => $this->discountPercentage,
            'discount_code'       => $this->discountCode,
            'image_url'           => $this->imageUrl,
            'max_claims'          => $this->maxClaims,
            'expires_at'          => $this->expiresAt,
        ], fn ($val) => $val !== null);
    }
}

