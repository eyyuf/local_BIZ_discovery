<?php

namespace App\Modules\Social\Contracts;

interface SocialPostInterface
{
    public function getPlaceActiveDealsCount(int $placeId): int;

    public function isPostActive(int $postId): bool;
}

