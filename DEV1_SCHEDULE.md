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

---
---

# 🌐 Developer 1 — Frontend Implementation Schedule (Discovery & Places Modules)

**Sprint Focus:** Consumer Exploration, Interactive Map, Filtered Search, and Place Profile Showcase  
**Frontend Modules Owned:**
* `frontend/src/modules/discovery/`
* `frontend/src/modules/places/`
* `frontend/src/shared/` (Map components, Place cards)

**Feature Branch:** `feature/frontend-discovery-places` (branched from `develop`)  
**Target Merge Branch:** `develop`

---

## 📋 Task Breakdown & Deadlines

| Task # | Feature | Files Involved | Detailed Sub-Tasks / Steps | Backend API Consumed |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Explore & Home Screen** | • `src/modules/discovery/api/discoveryApi.js`<br>• `src/modules/discovery/pages/ExplorePage.jsx`<br>• `src/modules/discovery/components/CategoryChips.jsx`<br>• `src/modules/discovery/components/ExploreFeedSection.jsx`<br>• `src/modules/discovery/hooks/useExploreFeed.js` | 1. Implement `discoveryApi.getExploreFeed()` & `getCategories()`.<br>2. Build hero banner with quick search trigger.<br>3. Horizontal category pills/carousel navigation.<br>4. Section renderers: Popular Nearby, Featured Categories, New Additions. | `GET /api/v1/discovery/explore`<br>`GET /api/v1/discovery/categories` |
| **2** | **Interactive Map & Search Engine** | • `src/modules/discovery/pages/SearchResultsPage.jsx`<br>• `src/modules/discovery/components/MapContainer.jsx`<br>• `src/modules/discovery/components/AutocompleteInput.jsx`<br>• `src/modules/discovery/components/SearchFiltersSidebar.jsx`<br>• `src/modules/discovery/components/PlaceResultCard.jsx`<br>• `src/modules/discovery/hooks/useSearchPlaces.js` | 1. Implement typeahead autocomplete suggestions drop-down.<br>2. Integrate interactive map (Leaflet / Mapbox) with clickable pins.<br>3. Build filter sidebar (radius slider, category dropdown, "Open Now" toggle).<br>4. Result cards with real-time distance badge & bookmark button. | `GET /api/v1/discovery/search`<br>`GET /api/v1/discovery/suggestions`<br>`GET /api/v1/discovery/nearby` |
| **3** | **Place Profile & Menu Showcase** | • `src/modules/places/api/placeApi.js`<br>• `src/modules/places/pages/PlaceDetailPage.jsx`<br>• `src/modules/places/components/PlaceHeader.jsx`<br>• `src/modules/places/components/OperatingHoursModal.jsx`<br>• `src/modules/places/components/MenuSectionList.jsx`<br>• `src/modules/places/components/MenuItemCard.jsx`<br>• `src/modules/places/hooks/usePlaceDetails.js` | 1. Implement `placeApi.getPlace(slug/id)` & `getMenu(placeId)`.<br>2. Place hero with cover photo, tags, directions button, and phone click.<br>3. "Open Now" dynamic status badge with weekly hours accordion.<br>4. Categorized menu item tabs with dietary tags & pricing cards. | `GET /api/v1/places/{place}`<br>`GET /api/v1/places/{place}/menu` |
| **4** | **Testing & Branch Integration** | • End-to-end flow checks<br>• Pull request to `develop` | 1. Verify responsive UI (Mobile + Desktop).<br>2. Test map pin click to Place Detail page transition.<br>3. Open PR and merge `feature/frontend-discovery-places` into `develop`. | Full integration test pass |

---

## 🛠️ Step-by-Step Technical Instructions

### Task 1: Discovery API & Explore Feed
1. **API:** `src/modules/discovery/api/discoveryApi.js`
   ```javascript
   export const discoveryApi = {
     getExploreFeed: (coords) => apiClient.get('/discovery/explore', { params: coords }),
     getCategories: () => apiClient.get('/discovery/categories'),
     getCategoryBySlug: (slug) => apiClient.get(`/discovery/categories/${slug}`),
     searchPlaces: (params) => apiClient.get('/discovery/search', { params }),
     getSuggestions: (q) => apiClient.get('/discovery/suggestions', { params: { q } }),
     getNearbyPlaces: (coords) => apiClient.get('/discovery/nearby', { params: coords }),
   };
   ```
2. **Hook:** `useExploreFeed.js`
   * Manages `{ sections, categories, loading, error }`.
   * Automatically requests user's browser geolocation (if permitted) to pass coordinates for `nearby_popular`.

---

### Task 2: Search & Interactive Map
1. **Autocomplete Typeahead:**
   * Debounces user input by 300ms.
   * Renders grouped suggestions (`places` vs `categories`).
   * Clicking a suggestion navigates to `/search?q=...` or `/categories/:slug`.
2. **Map Component (`MapContainer.jsx`):**
   * Renders map centered on current search coordinate or user's position.
   * Drops custom markers with price/rating badges.
   * Synchronizes map bounds (`viewport`) with search results.

---

### Task 3: Place Profile Details & Menus
1. **API:** `src/modules/places/api/placeApi.js`
   ```javascript
   export const placeApi = {
     getPlace: (idOrSlug) => apiClient.get(`/places/${idOrSlug}`),
     getMenu: (placeId) => apiClient.get(`/places/${placeId}/menu`),
     getMyPlaces: () => apiClient.get('/owner/places'),
   };
   ```
2. **PlaceDetailPage.jsx:**
   * Left column: Hero photos, address, map preview, operating hours breakdown, action buttons (Directions, Call, Share, Bookmark).
   * Center tabs:
     * Tab 1: **Menu** (rendered via `MenuSectionList.jsx`).
     * Tab 2: **Deals** (imports `DealCard` from Dev 2's `social` module).
     * Tab 3: **Reviews** (imports `ReviewList` & `RatingSummary` from Dev 2's `reviews` module).


