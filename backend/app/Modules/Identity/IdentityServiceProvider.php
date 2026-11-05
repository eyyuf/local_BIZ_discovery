<?php

namespace App\Modules\Identity;

use App\Modules\Identity\Contracts\UserQueryInterface;
use App\Modules\Identity\Services\UserQueryService;
use Illuminate\Support\ServiceProvider;

class IdentityServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(UserQueryInterface::class, UserQueryService::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/Database/Migrations');
        $this->loadRoutesFrom(__DIR__.'/Routes/api.php');
    }
}
