<?php

use App\Modules\Discovery\DiscoveryServiceProvider;
use App\Modules\Identity\IdentityServiceProvider;
use App\Modules\Place\PlaceServiceProvider;
use App\Modules\Review\ReviewServiceProvider;
use App\Modules\Social\SocialServiceProvider;
use App\Providers\AppServiceProvider;

return [
    AppServiceProvider::class,
    IdentityServiceProvider::class,
    PlaceServiceProvider::class,
    DiscoveryServiceProvider::class,
    SocialServiceProvider::class,
    ReviewServiceProvider::class,
];
