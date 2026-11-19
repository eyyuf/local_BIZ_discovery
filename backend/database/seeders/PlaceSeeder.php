<?php

namespace Database\Seeders;

use App\Modules\Discovery\Models\Category;
use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\OperatingHour;
use App\Modules\Place\Models\Place;
use App\Modules\Place\Models\PlaceImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlaceSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first() ?? User::factory()->create([
            'name'  => 'Admin User',
            'email' => 'admin@localspot.et',
        ]);

        $cafesCat = Category::where('slug', 'cafes')->first();
        $restCat  = Category::where('slug', 'restaurants')->first();
        $bakeCat  = Category::where('slug', 'bakeries')->first();
        $gymCat   = Category::where('slug', 'gyms')->first();
        $spaCat   = Category::where('slug', 'spas')->first();
        $workCat  = Category::where('slug', 'coworking')->first();
        $hotelCat = Category::where('slug', 'hotels')->first();

        $placesData = [
            [
                'name'        => 'Tomoca Coffee - Churchill Ave',
                'slug'        => 'tomoca-coffee-churchill-ave',
                'description' => 'The pioneer of modern coffee roasting in Addis Ababa since 1953. Iconic vintage Italian roast ambiance with rich Ethiopian Arabica espresso.',
                'address'     => 'Churchill Avenue, Piazza, Addis Ababa',
                'latitude'    => 9.03450000,
                'longitude'   => 38.75180000,
                'phone'       => '+251 11 111 2544',
                'website'     => 'https://tomocacoffee.com',
                'category_ids'=> array_filter([$cafesCat?->id]),
                'images'      => [
                    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
                ],
                'rating'      => 5,
            ],
            [
                'name'        => 'Kategna Traditional Restaurant',
                'slug'        => 'kategna-traditional-restaurant',
                'description' => 'Renowned for exquisite Ethiopian cuisine, authentic Kitfo, sizzling Doro Wat, and warm cultural hospitality.',
                'address'     => 'Cameroon Street, Bole Medhanealem, Addis Ababa',
                'latitude'    => 8.99840000,
                'longitude'   => 38.78850000,
                'phone'       => '+251 11 661 5454',
                'website'     => 'https://kategnarestaurant.com',
                'category_ids'=> array_filter([$restCat?->id]),
                'images'      => [
                    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
                ],
                'rating'      => 5,
            ],
            [
                'name'        => 'Mulmul Bakery & Patisserie',
                'slug'        => 'mulmul-bakery-patisserie',
                'description' => 'Addis Ababa’s favorite artisanal bakery offering freshly baked sourdough, crusty baguettes, and fine French-inspired pastries.',
                'address'     => 'Namibia St, Bole Atlas, Addis Ababa',
                'latitude'    => 9.01250000,
                'longitude'   => 38.77500000,
                'phone'       => '+251 11 662 3840',
                'website'     => 'https://mulmulbakery.com',
                'category_ids'=> array_filter([$bakeCat?->id]),
                'images'      => [
                    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80',
                ],
                'rating'      => 4,
            ],
            [
                'name'        => 'iceaddis Coworking & Tech Hub',
                'slug'        => 'iceaddis-coworking-tech-hub',
                'description' => 'The premier innovation hub and modern shared office space for developers, tech entrepreneurs, and digital nomads with ultra-fast fiber internet.',
                'address'     => 'Mickey Leland St, Bole Atlas, Addis Ababa',
                'latitude'    => 9.01020000,
                'longitude'   => 38.77610000,
                'phone'       => '+251 91 123 4567',
                'website'     => 'https://iceaddis.com',
                'category_ids'=> array_filter([$workCat?->id]),
                'images'      => [
                    'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
                ],
                'rating'      => 5,
            ],
            [
                'name'        => 'Bole Rock Fitness & Health Club',
                'slug'        => 'bole-rock-fitness-health-club',
                'description' => 'Premier health club with modern strength machines, cardio suites, heated indoor lap pool, steam room, and certified personal trainers.',
                'address'     => 'Bole Rwanda, Addis Ababa',
                'latitude'    => 8.98900000,
                'longitude'   => 38.77350000,
                'phone'       => '+251 11 661 1444',
                'website'     => 'https://bolerockfitness.com',
                'category_ids'=> array_filter([$gymCat?->id]),
                'images'      => [
                    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
                ],
                'rating'      => 4,
            ],
            [
                'name'        => 'Boston Day Spa & Wellness',
                'slug'        => 'boston-day-spa-wellness',
                'description' => 'Luxury urban sanctuary featuring soothing Swedish massages, reflexology, organic facials, and traditional herbal steam baths.',
                'address'     => 'Bole Road, Next to Edna Mall, Addis Ababa',
                'latitude'    => 8.99720000,
                'longitude'   => 38.78650000,
                'phone'       => '+251 11 662 6262',
                'website'     => 'https://bostondayspa.et',
                'category_ids'=> array_filter([$spaCat?->id]),
                'images'      => [
                    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80',
                ],
                'rating'      => 5,
            ],
            [
                'name'        => 'Hyatt Regency Addis Ababa',
                'slug'        => 'hyatt-regency-addis-ababa',
                'description' => 'World-class 5-star hotel centrally located on Meskel Square. Sophisticated dining, lush central courtyard, and premium luxury accommodation.',
                'address'     => 'Meskel Square, Addis Ababa',
                'latitude'    => 9.01050000,
                'longitude'   => 38.76100000,
                'phone'       => '+251 11 517 1234',
                'website'     => 'https://hyatt.com',
                'category_ids'=> array_filter([$hotelCat?->id]),
                'images'      => [
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
                ],
                'rating'      => 5,
            ],
            [
                'name'        => "Kaldi's Coffee - Bole Medhanealem",
                'slug'        => 'kaldis-coffee-bole-medhanealem',
                'description' => 'Ethiopia’s iconic domestic coffeehouse chain serving rich spiced Macchiatos, fresh juices, and delicious pastry snacks in a lively urban setting.',
                'address'     => 'Cameroon St, Near Medhanealem Church, Addis Ababa',
                'latitude'    => 8.99650000,
                'longitude'   => 38.78920000,
                'phone'       => '+251 11 662 0001',
                'website'     => 'https://kaldiscoffee.com',
                'category_ids'=> array_filter([$cafesCat?->id]),
                'images'      => [
                    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
                ],
                'rating'      => 4,
            ],
            [
                'name'        => 'Kuriftu Resort & Spa Bishoftu',
                'slug'        => 'kuriftu-resort-spa-bishoftu',
                'description' => 'Luxury lakeside sanctuary featuring tranquil volcanic crater lake views, organic massages, open-air cinema, and signature Ethiopian dining.',
                'address'     => 'Lake Kuriftu, Bishoftu, Oromia',
                'latitude'    => 8.75200000,
                'longitude'   => 38.98100000,
                'phone'       => '+251 11 433 9999',
                'website'     => 'https://kurifturesorts.com',
                'category_ids'=> array_filter([$spaCat?->id, $hotelCat?->id]),
                'images'      => [
                    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
                ],
                'rating'      => 5,
            ],
            [
                'name'        => 'Romina Restaurant & Pastry - Piazza',
                'slug'        => 'romina-restaurant-pastry-piazza',
                'description' => 'Classic historic dining landmark in old Piazza known for succulent steaks, traditional Tibs, and time-honored European confectionery.',
                'address'     => 'Cunningham St, Piazza, Addis Ababa',
                'latitude'    => 9.03610000,
                'longitude'   => 38.75230000,
                'phone'       => '+251 11 155 1288',
                'website'     => 'https://rominaethiopia.com',
                'category_ids'=> array_filter([$restCat?->id, $bakeCat?->id]),
                'images'      => [
                    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
                ],
                'rating'      => 4,
            ],
            [
                'name'        => 'Habesha 2000 Cultural Restaurant',
                'slug'        => 'habesha-2000-cultural-restaurant',
                'description' => 'Electrifying cultural dining experience featuring nightly traditional dance performances, live Masinko and Kirar music, and authentic national dishes.',
                'address'     => 'Bole Road, Near Edna Mall, Addis Ababa',
                'latitude'    => 8.99500000,
                'longitude'   => 38.78400000,
                'phone'       => '+251 11 618 2222',
                'website'     => 'https://habesha2000.et',
                'category_ids'=> array_filter([$restCat?->id]),
                'images'      => [
                    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
                ],
                'rating'      => 5,
            ],
            [
                'name'        => 'Lucy Lounge & Restaurant',
                'slug'        => 'lucy-lounge-restaurant',
                'description' => 'Peaceful garden restaurant adjacent to the National Museum of Ethiopia, serving gourmet fusion dishes and premium Ethiopian coffee under leafy trees.',
                'address'     => 'King George VI St, Arat Kilo, Addis Ababa',
                'latitude'    => 9.03800000,
                'longitude'   => 38.76150000,
                'phone'       => '+251 11 124 4455',
                'website'     => 'https://lucyrestaurant.et',
                'category_ids'=> array_filter([$restCat?->id, $cafesCat?->id]),
                'images'      => [
                    'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80',
                ],
                'rating'      => 5,
            ],
        ];

        foreach ($placesData as $data) {
            $categoryIds = $data['category_ids'];
            $imageUrls   = $data['images'];
            $ratingVal   = $data['rating'] ?? 5;
            unset($data['category_ids'], $data['images'], $data['rating']);

            $data['user_id']   = $user->id;
            $data['is_active'] = true;

            $place = Place::updateOrCreate(['slug' => $data['slug']], $data);

            // Sync categories
            if (!empty($categoryIds)) {
                $place->categories()->sync($categoryIds);
            }

            // Sync images
            PlaceImage::where('place_id', $place->id)->delete();
            foreach ($imageUrls as $idx => $url) {
                PlaceImage::create([
                    'place_id'      => $place->id,
                    'image_path'    => $url,
                    'is_cover'      => ($idx === 0),
                    'display_order' => $idx,
                ]);
            }

            // Add Operating Hours (open 7 days from 07:00 to 22:00)
            OperatingHour::where('place_id', $place->id)->delete();
            for ($day = 0; $day <= 6; $day++) {
                OperatingHour::create([
                    'place_id'    => $place->id,
                    'day_of_week' => $day,
                    'opens_at'    => '07:00:00',
                    'closes_at'   => '23:00:00',
                    'is_closed'   => false,
                ]);
            }

            // Add rating
            DB::table('place_ratings')->updateOrInsert(
                ['user_id' => $user->id, 'place_id' => $place->id],
                ['rating' => $ratingVal, 'updated_at' => now(), 'created_at' => now()]
            );
        }
    }
}

