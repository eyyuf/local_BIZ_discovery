<?php

namespace App\Providers;

use App\Support\Storage\CloudinaryStorageAdapter;
use Cloudinary\Cloudinary;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\ServiceProvider;
use League\Flysystem\Filesystem;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->app['filesystem']->extend('cloudinary', function ($app, $config) {
            if (isset($config['url']) && !empty($config['url'])) {
                $cloudinary = new Cloudinary($config['url']);
            } else {
                $cloudName = $config['cloud'] ?? env('CLOUDINARY_CLOUD_NAME');
                $apiKey = $config['key'] ?? env('CLOUDINARY_KEY');
                $apiSecret = $config['secret'] ?? env('CLOUDINARY_SECRET');

                $cloudinary = new Cloudinary([
                    'cloud' => [
                        'cloud_name' => !empty($cloudName) ? $cloudName : 'local-biz-cloud',
                        'api_key'    => !empty($apiKey) ? $apiKey : 'test-key',
                        'api_secret' => !empty($apiSecret) ? $apiSecret : 'test-secret',
                    ],
                    'url' => [
                        'secure' => $config['secure'] ?? true,
                    ],
                ]);
            }

            $adapter = new CloudinaryStorageAdapter($cloudinary, null, $config['prefix'] ?? null);

            return new FilesystemAdapter(new Filesystem($adapter, $config), $adapter, $config);
        });
    }
}
