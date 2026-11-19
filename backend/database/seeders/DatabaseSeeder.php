<?php

namespace Database\Seeders;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create or ensure standard business owner
        $owner = User::firstOrCreate(
            ['email' => 'owner@localspot.et'],
            [
                'name'              => 'Abebe Kebede',
                'password'          => 'password',
                'role'              => 'owner',
                'email_verified_at' => now(),
            ]
        );

        // 2. Create or ensure administrator
        $admin = User::firstOrNew(['email' => 'admin@localspot.et']);
        $admin->name = 'System Administrator';
        $admin->password = 'password';
        $admin->role = 'admin';
        $admin->email_verified_at = now();
        $admin->locked_at = null;
        $admin->save();

        RateLimiter::clear(Str::transliterate('admin@localspot.et|127.0.0.1'));
        RateLimiter::clear(Str::transliterate('admin@localspot.et|::1'));

        // 3. Seed Discovery categories
        $this->call(DiscoverySeeder::class);

        // 4. Seed Places
        $this->call(PlaceSeeder::class);

        // 5. Configure full KYC verification applications (12 items matching production Figma mockup)
        $licenseDoc = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200';
        $faydaDoc   = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200';

        $verificationsConfig = [
            // PENDING APPROVAL (5 places)
            'iceaddis-coworking-tech-hub' => [
                'status' => 'pending', 'is_verified' => false, 'tax_id' => '0049281742',
                'manager' => 'Abebe Kebede Tessema', 'fayda' => 'ET-1029-3847-5612', 'notes' => null, 'verified_at' => null,
            ],
            'tomoca-coffee-churchill-ave' => [
                'status' => 'pending', 'is_verified' => false, 'tax_id' => '0019283745',
                'manager' => 'Yared Hailemariam', 'fayda' => 'ET-8820-1928-3019', 'notes' => null, 'verified_at' => null,
            ],
            'kaldis-coffee-bole-medhanealem' => [
                'status' => 'pending', 'is_verified' => false, 'tax_id' => '0038472910',
                'manager' => 'Tseday Asrat', 'fayda' => 'ET-4920-1029-8472', 'notes' => null, 'verified_at' => null,
            ],
            'kuriftu-resort-spa-bishoftu' => [
                'status' => 'pending', 'is_verified' => false, 'tax_id' => '0028471928',
                'manager' => 'Tadiwos Belete', 'fayda' => 'ET-9018-2938-4710', 'notes' => null, 'verified_at' => null,
            ],
            'romina-restaurant-pastry-piazza' => [
                'status' => 'pending', 'is_verified' => false, 'tax_id' => '0059281039',
                'manager' => 'Binyam Worku', 'fayda' => 'ET-3810-2918-4729', 'notes' => null, 'verified_at' => null,
            ],

            // APPROVED / VERIFIED (4 places)
            'bole-rock-fitness-health-club' => [
                'status' => 'verified', 'is_verified' => true, 'tax_id' => '0089123456',
                'manager' => 'Selamawit Desta', 'fayda' => 'ET-9921-4412-8801', 'notes' => null, 'verified_at' => now()->subDays(3),
            ],
            'kategna-traditional-restaurant' => [
                'status' => 'verified', 'is_verified' => true, 'tax_id' => '0078192834',
                'manager' => 'Eskinder Joseph', 'fayda' => 'ET-7719-2019-3819', 'notes' => null, 'verified_at' => now()->subDays(5),
            ],
            'hyatt-regency-addis-ababa' => [
                'status' => 'verified', 'is_verified' => true, 'tax_id' => '0091827364',
                'manager' => 'Hedayatullah Reza', 'fayda' => 'ET-1102-9384-7561', 'notes' => null, 'verified_at' => now()->subDays(8),
            ],
            'mulmul-bakery-patisserie' => [
                'status' => 'verified', 'is_verified' => true, 'tax_id' => '0068192039',
                'manager' => 'Rahel Seyoum', 'fayda' => 'ET-6619-2810-3948', 'notes' => null, 'verified_at' => now()->subDays(12),
            ],

            // DECLINED / REJECTED (3 places)
            'boston-day-spa-wellness' => [
                'status' => 'rejected', 'is_verified' => false, 'tax_id' => '0011223344',
                'manager' => 'Dawit Haile', 'fayda' => 'ET-3321-7788-9900',
                'notes' => 'The uploaded Fayda ID barcode is obscured by glare. Please provide a clear scan from fayda.et or id.gov.et.',
                'verified_at' => null,
            ],
            'habesha-2000-cultural-restaurant' => [
                'status' => 'rejected', 'is_verified' => false, 'tax_id' => '0048192038',
                'manager' => 'Mulugeta Tesfaye', 'fayda' => 'ET-5510-2918-3819',
                'notes' => 'Trade license registration document has expired. Please submit the renewed 2016 E.C. license.',
                'verified_at' => null,
            ],
            'lucy-lounge-restaurant' => [
                'status' => 'rejected', 'is_verified' => false, 'tax_id' => '0033445566',
                'manager' => 'Almaz Kebede', 'fayda' => 'ET-2219-3019-4819',
                'notes' => 'General Manager legal name does not match the individual indicated on the trade license certificate.',
                'verified_at' => null,
            ],
        ];

        foreach ($verificationsConfig as $slug => $config) {
            $p = Place::where('slug', $slug)->first();
            if ($p) {
                $p->user_id               = $owner->id;
                $p->verification_status   = $config['status'];
                $p->is_verified           = $config['is_verified'];
                $p->tax_id                = $config['tax_id'];
                $p->manager_name          = $config['manager'];
                $p->fayda_fin             = $config['fayda'];
                $p->verification_document = $licenseDoc;
                $p->fayda_document        = $faydaDoc;
                $p->verification_notes    = $config['notes'];
                $p->verified_at           = $config['verified_at'];
                $p->save();
            }
        }
    }
}

