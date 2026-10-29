<?php

use App\Modules\Discovery\DiscoveryServiceProvider;
use App\Modules\Identity\IdentityServiceProvider;
use App\Modules\Place\PlaceServiceProvider;
use App\Providers\AppServiceProvider;

return [
    AppServiceProvider::class,
    IdentityServiceProvider::class,
    PlaceServiceProvider::class,
    DiscoveryServiceProvider::class,
];
