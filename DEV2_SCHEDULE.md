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

---
---

# 🌐 Developer 2 — Frontend Implementation Schedule (Identity, Social & Review Modules)

**Sprint Focus:** User Identity & Sessions, Deals & Voucher Wallet, Ratings & Community Reviews  
**Frontend Modules Owned:**
* `frontend/src/modules/identity/`
* `frontend/src/modules/social/`
* `frontend/src/modules/reviews/`
* `frontend/src/api/client.js` & `AuthContext`

**Feature Branch:** `feature/frontend-social-reviews` (branched from `develop`)  
**Target Merge Branch:** `develop`

---

## 📋 Task Breakdown & Deadlines

| Task # | Feature | Files Involved | Detailed Sub-Tasks / Steps | Backend API Consumed |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Identity, Auth & User Profile** | • `src/api/client.js`<br>• `src/modules/identity/api/identityApi.js`<br>• `src/modules/identity/context/AuthContext.jsx`<br>• `src/modules/identity/pages/LoginPage.jsx`<br>• `src/modules/identity/pages/RegisterPage.jsx`<br>• `src/modules/identity/pages/ProfilePage.jsx`<br>• `src/modules/identity/components/SavedBookmarksList.jsx`<br>• `src/modules/identity/hooks/useAuth.js` | 1. Setup Axios interceptor with `Authorization: Bearer <token>`.<br>2. Build `AuthContext` (login, logout, currentUser, token state).<br>3. Login & Register screens with field validation & error handling.<br>4. Profile screen with user information & "Saved Places" list. | `POST /api/v1/identity/login`<br>`POST /api/v1/identity/register`<br>`GET /api/v1/identity/profile`<br>`GET /api/v1/discovery/bookmarks`<br>`POST /api/v1/identity/logout` |
| **2** | **Social Deals & Voucher Claims** | • `src/modules/social/api/socialApi.js`<br>• `src/modules/social/pages/DealsFeedPage.jsx`<br>• `src/modules/social/components/DealCard.jsx`<br>• `src/modules/social/components/ClaimVoucherModal.jsx`<br>• `src/modules/social/pages/MyClaimsPage.jsx`<br>• `src/modules/social/components/PostLikeButton.jsx`<br>• `src/modules/social/components/CreateDealModal.jsx`<br>• `src/modules/social/hooks/useDealFeed.js`<br>• `src/modules/social/hooks/useDealClaim.js` | 1. Connect `socialApi` to backend endpoints.<br>2. Build dedicated Deals Feed (`/deals`) with category filter.<br>3. DealCard with countdown timer, discount pill, and like toggle.<br>4. Claim Voucher modal showing voucher code & expiry.<br>5. "My Claims" wallet page (`/my-claims`) listing active & redeemed vouchers.<br>6. Business Owner "Publish Deal" modal. | `GET /api/v1/social/deals`<br>`POST /api/v1/social/posts/{post}/claim`<br>`POST /api/v1/social/posts/{post}/like`<br>`GET /api/v1/social/my-claims`<br>`POST /api/v1/social/places/{place}/posts` |
| **3** | **Reviews & Rating System** | • `src/modules/reviews/api/reviewApi.js`<br>• `src/modules/reviews/components/PlaceRatingSummary.jsx`<br>• `src/modules/reviews/components/ReviewList.jsx`<br>• `src/modules/reviews/components/ReviewCard.jsx`<br>• `src/modules/reviews/components/WriteReviewModal.jsx`<br>• `src/modules/reviews/components/ReviewReplyThread.jsx`<br>• `src/modules/reviews/hooks/usePlaceReviews.js` | 1. Implement `reviewApi` for fetching & submitting reviews.<br>2. Rating breakdown widget (average stars, total reviews bar).<br>3. Reviews list component with pagination.<br>4. "Write a Review" modal with 1–5 interactive star rating selector.<br>5. Owner reply display & reply submission component. | `GET /api/v1/reviews/places/{place}`<br>`POST /api/v1/reviews/places/{place}`<br>`POST /api/v1/reviews/{review}/messages`<br>`DELETE /api/v1/reviews/{review}` |
| **4** | **Testing & Branch Integration** | • End-to-end token flow checks<br>• Pull request to `develop` | 1. Verify Sanctum token auto-injection & 401 redirect to Login.<br>2. Test deal claiming flow end-to-end with voucher generation.<br>3. Test submitting a review and seeing instant list update.<br>4. Open PR and merge `feature/frontend-social-reviews` into `develop`. | Full integration test pass |

---

## 🛠️ Step-by-Step Technical Instructions

### Task 1: API Client & Identity Module
1. **Axios Client:** `src/api/client.js`
   ```javascript
   import axios from 'axios';

   export const apiClient = axios.create({
     baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
     headers: {
       'Content-Type': 'application/json',
       'Accept': 'application/json',
     },
   });

   apiClient.interceptors.request.use((config) => {
     const token = localStorage.getItem('auth_token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```
2. **AuthContext:** `src/modules/identity/context/AuthContext.jsx`
   * Manages `{ user, token, isAuthenticated, login, register, logout }`.
   * Persists token to `localStorage`.
   * Exposes `useAuth()` hook for easy consumption across components.

---

### Task 2: Social Deals & Vouchers Flow
1. **API Implementation:** `src/modules/social/api/socialApi.js`
   * Connect all empty functions (`fetchDeals`, `claimDeal`, `toggleLike`, `getMyClaims`, `createPost`) to `apiClient`.
2. **Claim Voucher Flow:**
   * Clicking "Claim Voucher" on `DealCard` triggers `useDealClaim()`.
   * Sends `POST /api/v1/social/posts/{post}/claim`.
   * Pops up `ClaimVoucherModal` displaying the unique `voucher_code` (e.g. `DEAL-ABC1234`), instructions, and expiration timestamp.
   * Updates voucher count dynamically without page reload.
3. **My Claims Wallet (`MyClaimsPage.jsx`):**
   * Accessible from user navbar dropdown.
   * Displays claimed vouchers grouped into "Active" and "Redeemed / Expired" tabs.

---

### Task 3: Reviews & Ratings System
1. **API:** `src/modules/reviews/api/reviewApi.js`
   ```javascript
   export const reviewApi = {
     getPlaceReviews: (placeId, page = 1) => apiClient.get(`/reviews/places/${placeId}`, { params: { page } }),
     submitReview: (placeId, data) => apiClient.get ? apiClient.post(`/reviews/places/${placeId}`, data) : null,
     replyToReview: (reviewId, message) => apiClient.post(`/reviews/${reviewId}/messages`, { message }),
     deleteReview: (reviewId) => apiClient.delete(`/reviews/${reviewId}`),
   };
   ```
2. **PlaceRatingSummary.jsx:**
   * Displays prominent large star rating (e.g. `4.8 ★`) and rating count.
   * Renders bar progress distribution (5★, 4★, 3★, 2★, 1★).
3. **WriteReviewModal.jsx:**
   * Interactive hoverable star selector (1 to 5 stars).
   * Title and review text input with character counter.
   * Submits and refreshes the parent review list automatically.


