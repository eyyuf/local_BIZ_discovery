<?php

namespace App\Console\Commands;

use App\Modules\Discovery\Models\Category;
use App\Modules\Place\Models\OperatingHour;
use App\Modules\Place\Models\Place;
use App\Modules\Place\Models\PlaceImage;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ImportScrapedPlacesCommand extends Command
{
    protected $signature = 'places:import-scraped {file? : Path to scraped JSON file}';

    protected $description = 'Import scraped Addis Ababa places from Apify / Google Maps JSON export into places database';

    public function handle(): int
    {
        $filePath = $this->argument('file') ?: storage_path('app/scraped_places.json');

        if (!file_exists($filePath)) {
            $this->error("File not found at: {$filePath}");
            return Command::FAILURE;
        }

        $this->info("Loading scraped data from: {$filePath}");
        $content = file_get_contents($filePath);
        $items = json_decode($content, true);

        if (!is_array($items) || empty($items)) {
            $this->error('Invalid or empty JSON data in file.');
            return Command::FAILURE;
        }

        $this->info("Found " . count($items) . " places in JSON. Setting up categories...");
        $categories = $this->setupCategories();

        // Ensure system curator user exists as placeholder owner for unclaimed scraped places
        $systemUser = \App\Modules\Identity\Models\User::firstOrCreate(
            ['email' => 'curator@maed.et'],
            [
                'name'              => "Ma'ed Directory Curator",
                'password'          => bcrypt(Str::random(32)),
                'role'              => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $imported = 0;
        $updated = 0;
        $skipped = 0;

        $bar = $this->output->createProgressBar(count($items));
        $bar->start();

        foreach ($items as $item) {
            // 1. Skip permanently closed places
            if (!empty($item['permanentlyClosed'])) {
                $skipped++;
                $bar->advance();
                continue;
            }

            // 2. Validate coordinates
            $lat = isset($item['location']['lat']) ? (float)$item['location']['lat'] : null;
            $lng = isset($item['location']['lng']) ? (float)$item['location']['lng'] : null;

            if ($lat === null || $lng === null || $lat < 3.0 || $lat > 15.0 || $lng < 33.0 || $lng > 48.0) {
                // Invalid or missing coordinates
                $skipped++;
                $bar->advance();
                continue;
            }

            $title = trim($item['title'] ?? '');
            if (empty($title)) {
                $skipped++;
                $bar->advance();
                continue;
            }

            // 3. Resolve category
            $categoryKey = $this->resolveCategoryKey($item);
            $targetCategory = $categories[$categoryKey] ?? $categories['restaurants'];

            // 4. Construct unique slug
            $baseSlug = Str::slug($title);
            if (empty($baseSlug)) {
                $baseSlug = 'spot';
            }
            $slugHash = substr(md5($title . $lat . $lng), 0, 6);
            $slug = Str::limit($baseSlug, 50, '') . '-' . $slugHash;

            // 5. Clean address & neighborhood
            $address = trim($item['address'] ?? '');
            if (empty($address)) {
                $street = trim($item['street'] ?? '');
                $address = $street ? "{$street}, Addis Ababa, Ethiopia" : 'Addis Ababa, Ethiopia';
            }

            $phone = !empty($item['phone']) ? trim($item['phone']) : null;
            $website = !empty($item['website']) && filter_var($item['website'], FILTER_VALIDATE_URL) ? $item['website'] : null;

            // 6. Description
            $desc = $item['ownerDescription'] ?? $item['subTitle'] ?? null;
            if (empty($desc)) {
                $neighborhood = $item['neighborhood'] ?? 'Addis Ababa';
                $score = !empty($item['totalScore']) ? $item['totalScore'] . '★' : 'Authentic';
                $desc = "{$title} is a popular spot located in {$neighborhood}, Addis Ababa. Rated {$score} by local diners.";
            }

            // 7. Find existing or create new Place
            $existing = Place::where('name', $title)
                ->whereBetween('latitude', [$lat - 0.0005, $lat + 0.0005])
                ->whereBetween('longitude', [$lng - 0.0005, $lng + 0.0005])
                ->first();

            $isNew = false;
            if (!$existing) {
                $existing = new Place();
                $existing->slug = $slug;
                $existing->user_id = $systemUser->id;
                $isNew = true;
            }

            $existing->name = $title;
            $existing->description = $desc;
            $existing->address = $address;
            $existing->latitude = $lat;
            $existing->longitude = $lng;
            $existing->phone = $phone;
            $existing->website = $website;
            $existing->is_active = true;
            $existing->is_verified = false; // Unclaimed spot, ready for real owner verification!
            $existing->verification_status = 'unverified';
            $existing->save();

            // 8. Attach Category
            $existing->categories()->syncWithoutDetaching([$targetCategory->id]);

            // 9. Cover Image
            $imageUrl = $item['imageUrl'] ?? null;
            if (!empty($imageUrl) && filter_var($imageUrl, FILTER_VALIDATE_URL)) {
                PlaceImage::updateOrCreate(
                    [
                        'place_id' => $existing->id,
                        'is_cover' => true,
                    ],
                    [
                        'image_path'    => $imageUrl,
                        'display_order' => 0,
                    ]
                );
            }

            // 10. Operating Hours
            if (!empty($item['openingHours']) && is_array($item['openingHours'])) {
                $this->importOperatingHours($existing->id, $item['openingHours']);
            }

            if ($isNew) {
                $imported++;
            } else {
                $updated++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("================ IMPORT SUMMARY ================");
        $this->info("✓ Newly Imported: {$imported} places");
        $this->info("✓ Updated:        {$updated} places");
        $this->info("⚠ Skipped:        {$skipped} places (closed or missing coordinates)");
        $this->info("✓ Total in DB:    " . Place::count() . " places");
        $this->info("===============================================");

        return Command::SUCCESS;
    }

    /**
     * Map Google Maps categories and search terms to our internal category models.
     */
    protected function resolveCategoryKey(array $item): string
    {
        $raw = strtolower(
            ($item['categoryName'] ?? '') . ' ' .
            implode(' ', (array)($item['categories'] ?? [])) . ' ' .
            ($item['title'] ?? '')
        );

        if (str_contains($raw, 'cafe') || str_contains($raw, 'coffee') || str_contains($raw, 'espresso') || str_contains($raw, 'tea')) {
            return 'cafes';
        }

        if (str_contains($raw, 'bar') || str_contains($raw, 'lounge') || str_contains($raw, 'pub') || str_contains($raw, 'club') || str_contains($raw, 'cocktail') || str_contains($raw, 'brewery')) {
            return 'bars-nightlife';
        }

        if (str_contains($raw, 'bakery') || str_contains($raw, 'pastry') || str_contains($raw, 'cake') || str_contains($raw, 'dessert')) {
            return 'bakeries';
        }

        if (str_contains($raw, 'traditional') || str_contains($raw, 'ethiopian') || str_contains($raw, 'habesha') || str_contains($raw, 'injera') || str_contains($raw, 'cultural')) {
            return 'traditional-food';
        }

        if (str_contains($raw, 'fast food') || str_contains($raw, 'burger') || str_contains($raw, 'pizza') || str_contains($raw, 'sandwich')) {
            return 'fast-food';
        }

        if (str_contains($raw, 'juice') || str_contains($raw, 'smoothie')) {
            return 'juice-smoothies';
        }

        return 'restaurants';
    }

    /**
     * Ensure internal categories exist.
     */
    protected function setupCategories(): array
    {
        $root = Category::updateOrCreate(
            ['slug' => 'food-drink'],
            [
                'name'      => 'Food & Drink',
                'icon'      => 'utensils',
                'parent_id' => null,
                'is_active' => true,
            ]
        );

        $definitions = [
            'restaurants'       => ['name' => 'Restaurants', 'icon' => 'utensils'],
            'cafes'             => ['name' => 'Cafes & Coffee', 'icon' => 'coffee'],
            'bars-nightlife'    => ['name' => 'Bars & Lounges', 'icon' => 'wine'],
            'bakeries'          => ['name' => 'Bakeries & Pastries', 'icon' => 'croissant'],
            'traditional-food'  => ['name' => 'Traditional Ethiopian', 'icon' => 'utensils-crossed'],
            'fast-food'         => ['name' => 'Fast Food & Bites', 'icon' => 'pizza'],
            'juice-smoothies'   => ['name' => 'Juice & Smoothies', 'icon' => 'cup-soda'],
        ];

        $categories = [];
        foreach ($definitions as $slug => $def) {
            $categories[$slug] = Category::updateOrCreate(
                ['slug' => $slug],
                [
                    'name'      => $def['name'],
                    'icon'      => $def['icon'],
                    'parent_id' => $root->id,
                    'is_active' => true,
                ]
            );
        }

        return $categories;
    }

    /**
     * Parse and import Google Maps operating hours into our schema.
     */
    protected function importOperatingHours(int $placeId, array $rawHours): void
    {
        $dayMap = [
            'sunday'    => 0,
            'monday'    => 1,
            'tuesday'   => 2,
            'wednesday' => 3,
            'thursday'  => 4,
            'friday'    => 5,
            'saturday'  => 6,
        ];

        foreach ($rawHours as $entry) {
            $dayName = strtolower(trim($entry['day'] ?? ''));
            if (!isset($dayMap[$dayName])) {
                continue;
            }

            $dayNum = $dayMap[$dayName];
            $hoursStr = trim($entry['hours'] ?? '');

            if (empty($hoursStr) || str_contains(strtolower($hoursStr), 'closed')) {
                OperatingHour::updateOrCreate(
                    ['place_id' => $placeId, 'day_of_week' => $dayNum],
                    ['is_closed' => true, 'opens_at' => null, 'closes_at' => null]
                );
                continue;
            }

            if (str_contains(strtolower($hoursStr), 'open 24 hours') || str_contains(strtolower($hoursStr), '24 hours')) {
                OperatingHour::updateOrCreate(
                    ['place_id' => $placeId, 'day_of_week' => $dayNum],
                    ['is_closed' => false, 'opens_at' => '00:00:00', 'closes_at' => '23:59:59']
                );
                continue;
            }

            // e.g. "11 AM to 11 PM" or "8:30 AM to 10:00 PM"
            // Replace unicode non-breaking space
            $hoursStr = str_replace(["\u{202F}", "\u{00A0}"], ' ', $hoursStr);
            $parts = preg_split('/ to |–|-/i', $hoursStr);

            if (count($parts) === 2) {
                try {
                    $opensAt = Carbon::parse(trim($parts[0]))->format('H:i:s');
                    $closesAt = Carbon::parse(trim($parts[1]))->format('H:i:s');

                    OperatingHour::updateOrCreate(
                        ['place_id' => $placeId, 'day_of_week' => $dayNum],
                        ['is_closed' => false, 'opens_at' => $opensAt, 'closes_at' => $closesAt]
                    );
                } catch (\Throwable) {
                    // Ignore unparseable individual day format
                }
            }
        }
    }
}
