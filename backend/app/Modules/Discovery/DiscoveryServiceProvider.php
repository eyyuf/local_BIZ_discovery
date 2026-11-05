<?php

namespace App\Modules\Discovery;

use App\Modules\Discovery\Contracts\DiscoveryQueryInterface;
use App\Modules\Discovery\Services\DiscoveryQueryService;
use Illuminate\Support\ServiceProvider;

class DiscoveryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(DiscoveryQueryInterface::class, DiscoveryQueryService::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/Database/Migrations');
        $this->loadRoutesFrom(__DIR__ . '/Routes/api.php');
    }
}
