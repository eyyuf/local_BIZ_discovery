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

        // 5. Assign some places to owner with pending, verified, and rejected verification states
        $places = Place::all();
        if ($places->count() > 0) {
            // Place 1: Pending Verification (TIN + Trade License + Fayda ID)
            $p1 = $places[0];
            $p1->user_id = $owner->id;
            $p1->verification_status = 'pending';
            $p1->is_verified = false;
            $p1->tax_id = '0049281742';
            $p1->manager_name = 'Abebe Kebede Tessema';
            $p1->fayda_fin = 'ET-1029-3847-5612';
            $p1->verification_document = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200';
            $p1->fayda_document = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200';
            $p1->save();

            if ($places->count() > 1) {
                // Place 2: Verified place
                $p2 = $places[1];
                $p2->user_id = $owner->id;
                $p2->verification_status = 'verified';
                $p2->is_verified = true;
                $p2->tax_id = '0089123456';
                $p2->manager_name = 'Selamawit Desta';
                $p2->fayda_fin = 'ET-9921-4412-8801';
                $p2->verification_document = 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200';
                $p2->fayda_document = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200';
                $p2->verified_at = now()->subDays(2);
                $p2->save();
            }

            if ($places->count() > 2) {
                // Place 3: Rejected place with reviewer feedback
                $p3 = $places[2];
                $p3->user_id = $owner->id;
                $p3->verification_status = 'rejected';
                $p3->is_verified = false;
                $p3->tax_id = '0011223344';
                $p3->manager_name = 'Dawit Haile';
                $p3->fayda_fin = 'ET-3321-7788-9900';
                $p3->verification_document = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200';
                $p3->fayda_document = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200';
                $p3->verification_notes = 'The uploaded Fayda ID barcode is obscured by glare. Please provide a clear scan from fayda.et.';
                $p3->save();
            }
        }
    }
}

