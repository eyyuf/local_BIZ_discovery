<?php

namespace App\Modules\Discovery;

use Illuminate\Support\ServiceProvider;

class DiscoveryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/Database/Migrations');
        $this->loadRoutesFrom(__DIR__ . '/Routes/api.php');
    }
}
