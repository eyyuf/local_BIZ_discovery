<?php

namespace Database\Seeders;

use App\Modules\Discovery\Models\Amenity;
use App\Modules\Discovery\Models\Category;
use Illuminate\Database\Seeder;

class DiscoverySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Root Categories
        $roots = [
            'food-drink' => [
                'name' => 'Food & Drink',
                'icon' => 'utensils',
            ],
            'shopping' => [
                'name' => 'Shopping',
                'icon' => 'shopping-bag',
            ],
            'health-wellness' => [
                'name' => 'Health & Wellness',
                'icon' => 'heart-pulse',
            ],
            'services' => [
                'name' => 'Services',
                'icon' => 'wrench',
            ],
            'hotels' => [
                'name' => 'Hotels',
                'icon' => 'hotel',
            ],
        ];

        $rootModels = [];
        foreach ($roots as $slug => $data) {
            $rootModels[$slug] = Category::updateOrCreate(
                ['slug' => $slug],
                [
                    'name'      => $data['name'],
                    'icon'      => $data['icon'],
                    'parent_id' => null,
                    'is_active' => true,
                ]
            );
        }

        // 2. Subcategories
        $subcategories = [
            [
                'parent' => 'food-drink',
                'name'   => 'Cafes',
                'slug'   => 'cafes',
                'icon'   => 'coffee',
            ],
            [
                'parent' => 'food-drink',
                'name'   => 'Restaurants',
                'slug'   => 'restaurants',
                'icon'   => 'utensils',
            ],
            [
                'parent' => 'food-drink',
                'name'   => 'Bakeries',
                'slug'   => 'bakeries',
                'icon'   => 'croissant',
            ],
            [
                'parent' => 'health-wellness',
                'name'   => 'Gyms',
                'slug'   => 'gyms',
                'icon'   => 'dumbbell',
            ],
            [
                'parent' => 'health-wellness',
                'name'   => 'Spas',
                'slug'   => 'spas',
                'icon'   => 'spa',
            ],
            [
                'parent' => 'services',
                'name'   => 'Coworking',
                'slug'   => 'coworking',
                'icon'   => 'laptop',
            ],
        ];

        foreach ($subcategories as $sub) {
            $parent = $rootModels[$sub['parent']] ?? null;

            if ($parent) {
                Category::updateOrCreate(
                    ['slug' => $sub['slug']],
                    [
                        'name'      => $sub['name'],
                        'icon'      => $sub['icon'],
                        'parent_id' => $parent->id,
                        'is_active' => true,
                    ]
                );
            }
        }

        // 3. Amenities
        $amenities = [
            [
                'name' => 'Free Wi-Fi',
                'slug' => 'free-wifi',
                'icon' => 'wifi',
            ],
            [
                'name' => 'Free Parking',
                'slug' => 'free-parking',
                'icon' => 'square-parking',
            ],
            [
                'name' => 'Outdoor Seating',
                'slug' => 'outdoor-seating',
                'icon' => 'sun',
            ],
            [
                'name' => 'Air Conditioning',
                'slug' => 'air-conditioning',
                'icon' => 'snowflake',
            ],
        ];

        foreach ($amenities as $amenity) {
            Amenity::updateOrCreate(
                ['slug' => $amenity['slug']],
                [
                    'name' => $amenity['name'],
                    'icon' => $amenity['icon'],
                ]
            );
        }
    }
}
