<?php

namespace App\Modules\Review;

use App\Modules\Review\Contracts\ReviewQueryInterface;
use App\Modules\Review\Models\Review;
use App\Modules\Review\Models\ReviewResponse;
use App\Modules\Review\Policies\ReviewPolicy;
use App\Modules\Review\Policies\ReviewResponsePolicy;
use App\Modules\Review\Services\ReviewQueryService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class ReviewServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ReviewQueryInterface::class, ReviewQueryService::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/Database/Migrations');
        $this->loadRoutesFrom(__DIR__ . '/Routes/api.php');

        Gate::policy(Review::class, ReviewPolicy::class);
        Gate::policy(ReviewResponse::class, ReviewResponsePolicy::class);
    }
}
