# 👤 Developer 2 — Discovery Module Implementation Schedule

**Target Sprint Window:** Friday, Oct 30 – Sunday, Nov 1, 2026  
**Module:** Discovery (`backend/app/Modules/Discovery`)  
**Domain Focus:** Search Engine, Autocomplete Typeahead, and User Bookmarks  

---

## 📋 Task Breakdown & Deadlines

| Task # | Feature | Files Involved | Detailed Sub-Tasks / Steps | API Endpoint & Expected Output | Hard Deadline |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **1** | **User Bookmarks (Save/Unsave)** | • `app/Modules/Discovery/Actions/ToggleBookmarkAction.php`<br>• `app/Modules/Discovery/Controllers/BookmarkController.php`<br>• `app/Modules/Discovery/Resources/BookmarkResource.php`<br>• `app/Modules/Discovery/Policies/BookmarkPolicy.php` | 1. If bookmark exists for `(user_id, place_id)` → delete it (return `false`).<br>2. If not → create `PlaceBookmark` (return `true`).<br>3. `toggle()`: Returns `{ bookmarked: bool, message: string }`.<br>4. `index()`: Return paginated user bookmarks with `place` relation via `BookmarkResource`. | `POST /api/v1/discovery/bookmarks/{place}`<br>`GET /api/v1/discovery/bookmarks`<br>→ Toggle status & saved places list | **Friday, Oct 30** |
| **2** | **Search Autocomplete (Typeahead)** | • `app/Modules/Discovery/Requests/SuggestionRequest.php`<br>• `app/Modules/Discovery/Actions/GetSearchSuggestionsAction.php`<br>• `app/Modules/Discovery/Controllers/SuggestionController.php` | 1. Validate `q` (required, min 1), `limit` (default `10`).<br>2. Query matching active places (`name ILIKE :q%`).<br>3. Query matching active categories (`name ILIKE :q%`).<br>4. Merge into unified list: `[{ type: 'place'/'category', label, slug }]`.<br>5. Return suggestions JSON array. | `GET /api/v1/discovery/suggestions?q=caf`<br>→ Fast typeahead suggestion list | **Saturday, Oct 31** |
| **3** | **Multi-Filter Search Engine** | • `app/Modules/Discovery/Requests/SearchPlacesRequest.php`<br>• `app/Modules/Discovery/Actions/SearchPlacesAction.php`<br>• `app/Modules/Discovery/Controllers/SearchController.php`<br>• `app/Modules/Discovery/Resources/SearchResultResource.php` | 1. Apply keyword search on `name`, `description`, `address`.<br>2. Apply category filter via `whereHas('categories')`.<br>3. Apply PostGIS proximity & radius when coordinates passed.<br>4. Apply `open_now` check against `operating_hours`.<br>5. Apply sorting (`distance`, `newest`) & pagination.<br>6. Return `SearchResultResource::collection($paginator)`. | `GET /api/v1/discovery/search?q=...&category=...`<br>→ Paginated search results with filters | **Sunday, Nov 1 (Midday)** |
| **4** | **Testing & Branch Merge** | • `tests/Feature/DiscoveryDev2Test.php` | 1. Write tests for bookmarks toggle, listing, suggestions, and multi-filter search.<br>2. Run `php artisan test --filter=DiscoveryDev2Test`.<br>3. Resolve any regressions.<br>4. Open PR and merge `feature/discovery` into `main`. | Test suite passes 100%<br>PR ready for merge | **Sunday, Nov 1 (End of Day)** |

---

## 🛠️ Step-by-Step Technical Instructions

### Task 1: User Bookmarks (`POST & GET /api/v1/discovery/bookmarks`)
1. **Action:** `ToggleBookmarkAction::execute(User $user, Place $place): bool`
   ```php
   $bookmark = PlaceBookmark::where('user_id', $user->id)
       ->where('place_id', $place->id)
       ->first();

   if ($bookmark) {
       $bookmark->delete();
       return false; // unsaved
   }

   PlaceBookmark::create([
       'user_id'  => $user->id,
       'place_id' => $place->id,
   ]);

   return true; // saved
   ```
2. **Controller:** `BookmarkController`
   - `toggle()`: Call action, return `['bookmarked' => $status, 'message' => $status ? 'Place saved.' : 'Place removed from saved.']`.
   - `index()`: Fetch `$request->user()->bookmarks()->with('place')->latest()->paginate(15)`, return `BookmarkResource::collection($bookmarks)`.

---

### Task 2: Search Autocomplete (`GET /api/v1/discovery/suggestions`)
1. **Request:** `SuggestionRequest`
   - Rules: `q` (required, string, min 1, max 100), `limit` (optional integer 1–15, default 10).
2. **Action:** `GetSearchSuggestionsAction::execute(string $query, int $limit = 10): array`
   - Query places: `Place::where('is_active', true)->where('name', 'ILIKE', "%{$query}%")->limit(5)->get(['id', 'name', 'slug'])`.
   - Query categories: `Category::where('is_active', true)->where('name', 'ILIKE', "%{$query}%")->limit(5)->get(['id', 'name', 'slug'])`.
   - Merge and format into:
     ```php
     return [
         'suggestions' => $results // Array of ['type' => 'place'|'category', 'label' => '...', 'slug' => '...']
     ];
     ```
3. **Controller:** `SuggestionController::index`
   - Calls action and returns JSON response.

---

### Task 3: Multi-Filter Search Engine (`GET /api/v1/discovery/search`)
1. **Request:** `SearchPlacesRequest`
   - Rules: `q`, `category`, `lat`, `lng`, `radius`, `open_now`, `sort_by`, `page`, `per_page`.
2. **Action:** `SearchPlacesAction::execute(array $filters): LengthAwarePaginator`
   - Start query: `Place::query()->where('is_active', true)`.
   - If `q`: `where(function ($query) use ($q) { $query->where('name', 'ILIKE', "%{$q}%")->orWhere('description', 'ILIKE', "%{$q}%"); })`.
   - If `category`: `whereHas('categories', fn($c) => $c->where('slug', $filters['category']))`.
   - If `lat` & `lng`:
     - Apply `withDistanceTo($lat, $lng)`.
     - If `radius`: apply `withinRadius($lat, $lng, $radius)`.
   - If `open_now`:
     - Filter places open at current weekday & time from `operating_hours`.
   - Sorting:
     - `distance` (if coordinates present) $\rightarrow$ `orderBy('distance_km', 'asc')`.
     - `newest` $\rightarrow$ `latest()`.
   - Paginate with `paginate($perPage)`.
3. **Controller:** `SearchController::search`
   - Call action, return `SearchResultResource::collection($results)`.

---

### Task 4: Automated Testing
1. Create `tests/Feature/DiscoveryDev2Test.php` covering:
   - User can toggle bookmark (save then unsave).
   - User can fetch their paginated bookmarks.
   - Unauthorized user cannot access bookmarks endpoints (401).
   - Suggestions endpoint returns matching places and categories.
   - Search by keyword filters name and description correctly.
   - Search by category filters properly.
   - Search with radius and sorting works accurately.

