# 👤 Developer 1 — Discovery Module Implementation Schedule

**Target Sprint Window:** Friday, Oct 30 – Sunday, Nov 1, 2026  
**Module:** Discovery (`backend/app/Modules/Discovery`)  
**Domain Focus:** Map Proximity, Home Explore Feed, and Categories  

---

## 📋 Task Breakdown & Deadlines

| Task # | Feature | Files Involved | Detailed Sub-Tasks / Steps | API Endpoint & Expected Output | Hard Deadline |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **1** | **Proximity Map Pins** | • `app/Modules/Discovery/Requests/NearbyPlacesRequest.php`<br>• `app/Modules/Discovery/Actions/GetNearbyPlacesAction.php`<br>• `app/Modules/Discovery/Controllers/SearchController.php`<br>• `app/Modules/Discovery/Resources/SearchResultResource.php` | 1. Validate `lat`, `lng`, `radius` (default `5.0` km), `limit` (default `20`).<br>2. Execute PostGIS scopes: `withinRadius()` + `withDistanceTo()`.<br>3. Order by `distance_km ASC` & apply limit.<br>4. Return `SearchResultResource::collection($places)`.<br>5. Verify query returns map pins with distance. | `GET /api/v1/discovery/nearby`<br>→ Array of places sorted by nearest distance | **Friday, Oct 30** |
| **2** | **Category Navigation & Seeders** | • `database/seeders/DiscoverySeeder.php`<br>• `app/Modules/Discovery/Controllers/CategoryController.php`<br>• `app/Modules/Discovery/Resources/CategoryResource.php`<br>• `app/Modules/Discovery/Resources/SearchResultResource.php` | 1. Create seeder for parent categories, subcategories & amenities.<br>2. Run `php artisan db:seed`.<br>3. `index()`: Fetch active root categories with active `children`.<br>4. `show()`: Bind `{category:slug}` & fetch paginated places for category + subcategories.<br>5. Return `CategoryResource` and `SearchResultResource`. | `GET /api/v1/discovery/categories`<br>`GET /api/v1/discovery/categories/{category:slug}`<br>→ Nested category tree & category places | **Saturday, Oct 31** |
| **3** | **Curated Explore Home Feed** | • `app/Modules/Discovery/Actions/GetExploreFeedAction.php`<br>• `app/Modules/Discovery/Controllers/ExploreController.php`<br>• `app/Modules/Discovery/Resources/ExploreSectionResource.php` | 1. Assemble Section 1 (*"nearby_popular"*): PostGIS nearby places if coords provided.<br>2. Assemble Section 2 (*"featured_categories"*): Top active categories.<br>3. Assemble Section 3 (*"new_additions"*): 10 latest active businesses.<br>4. Return formatted `ExploreSectionResource::collection($sections)`. | `GET /api/v1/discovery/explore`<br>→ Grouped homepage sections payload | **Sunday, Nov 1 (Midday)** |
| **4** | **Testing & Branch Merge** | • `tests/Feature/DiscoveryDev1Test.php` | 1. Write tests for `nearby`, `categories`, and `explore` endpoints.<br>2. Run `php artisan test --filter=DiscoveryDev1Test`.<br>3. Resolve any regressions.<br>4. Open PR and merge `feature/discovery` into `main`. | Test suite passes 100%<br>PR ready for merge | **Sunday, Nov 1 (End of Day)** |

---

## 🛠️ Step-by-Step Technical Instructions

### Task 1: Proximity Map Pins (`GET /api/v1/discovery/nearby`)
1. **Request:** `NearbyPlacesRequest`
   - Rules: `lat` (required, between -90, 90), `lng` (required, between -180, 180), `radius` (optional numeric 0.5–50), `limit` (optional integer 1–100).
2. **Action:** `GetNearbyPlacesAction::execute(float $lat, float $lng, float $radiusKm = 5.0, int $limit = 20)`
   - Query:
     ```php
     return Place::query()
         ->where('is_active', true)
         ->withinRadius($lat, $lng, $radiusKm)
         ->withDistanceTo($lat, $lng)
         ->orderBy('distance_km', 'asc')
         ->limit($limit)
         ->with(['categories'])
         ->get();
     ```
3. **Controller:** `SearchController::nearby`
   - Extract validated parameters, call action, return `SearchResultResource::collection($places)`.

---

### Task 2: Categories Navigation
1. **Seeder:** `database/seeders/DiscoverySeeder.php`
   - Seed top-level categories (*Food & Drink, Shopping, Health & Wellness, Services, Hotels*).
   - Seed subcategories (*Cafes, Restaurants, Bakeries, Gyms, Spas, Coworking*).
   - Seed amenities (*Free Wi-Fi, Free Parking, Outdoor Seating, Air Conditioning*).
2. **Controller:** `CategoryController`
   - `index()`: Return active root categories (`whereNull('parent_id')`) with active children.
   - `show(Category $category)`: Return category details and places belonging to it or its subcategories.

---

### Task 3: Explore Home Feed (`GET /api/v1/discovery/explore`)
1. **Action:** `GetExploreFeedAction::execute(?float $lat = null, ?float $lng = null)`
   - Returns 3 curated sections:
     1. `nearby_popular`: If `$lat` & `$lng` present, closest active places; otherwise top places.
     2. `featured_categories`: Active root categories with places.
     3. `new_additions`: 10 most recent places (`latest()->take(10)->get()`).
2. **Controller:** `ExploreController::index`
   - Returns `ExploreSectionResource::collection($sections)`.

---

### Task 4: Automated Testing
1. Create `tests/Feature/DiscoveryDev1Test.php` covering:
   - Nearby proximity query returns places in ascending distance order.
   - Nearby search excludes places beyond the radius.
   - Category listing includes nested children.
   - Category show returns category + associated places.
   - Explore feed returns all 3 structured sections.

