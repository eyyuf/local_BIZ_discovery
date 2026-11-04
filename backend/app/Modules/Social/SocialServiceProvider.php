<?php

namespace App\Modules\Social;

use App\Modules\Social\Models\Post;
use App\Modules\Social\Policies\PostPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class SocialServiceProvider extends ServiceProvider
{
    public function register(): void
    {
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/Database/Migrations');
        $this->loadRoutesFrom(__DIR__ . '/Routes/api.php');
        Gate::policy(Post::class, PostPolicy::class);
    }
}

