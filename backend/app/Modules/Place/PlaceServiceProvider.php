<?php

namespace App\Modules\Place;

use App\Modules\Place\Contracts\PlaceQueryInterface;
use App\Modules\Place\Services\PlaceQueryService;
use Illuminate\Support\ServiceProvider;

class PlaceServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(PlaceQueryInterface::class, PlaceQueryService::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/Database/Migrations');
        $this->loadRoutesFrom(__DIR__ . '/Routes/api.php');
    }
}
