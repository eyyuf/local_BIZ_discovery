# Local Spot Ethiopia

## Modular Frontend Architecture & UI/UX Design System Specification

> **Document:** `frontend1.md`  
> **Platform version:** 3.2.0  
> **Status:** Architecture specification  
> **Scope:** Frontend only  
> **Stack:** React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand, React Router, Axios, Leaflet  
> **Visual direction:** PhonoFilm-inspired dark obsidian editorial and Ethiopian cultural gastronomy  
> **Primary geography:** Addis Ababa and Bishoftu, Ethiopia

---

## 1. Purpose and architectural direction

Local Spot is a hyper-local discovery platform for Ethiopian restaurants, cafés, coffee roasters, cultural kitchens, boutique stays, and other interesting local places.

The frontend should combine an image-led editorial experience with practical discovery: search, categories, proximity, maps, place details, bookmarks, reviews, and account features where supported by the existing backend.

This document turns the visual specification into a **modular frontend architecture**. It defines ownership, dependencies, shared contracts, page composition, and implementation rules so that features can evolve without creating a large collection of tightly coupled components.

### 1.1 Architectural principles

1. **Feature-first organization:** Put domain-specific pages, components, hooks, API functions, types, and state inside their owning feature.
2. **Shared UI stays domain-neutral:** Buttons, inputs, dialogs, typography, layout primitives, and generic media components belong in shared UI.
3. **One source of truth:** TanStack Query owns remote server state. Zustand owns only small pieces of client-side global state. URL search parameters own shareable search and filter state.
4. **Composition over giant components:** Pages compose feature components. They should not contain the implementation of every section themselves.
5. **Backend contract is authoritative:** Do not invent endpoints, response fields, ratings, review counts, verification states, amenities, or capabilities. Adapt the frontend to the actual Laravel API.
6. **Progressive disclosure:** Show the information needed to choose a place on cards. Reveal fuller descriptions, hours, menus, contacts, and other details on the place page.
7. **No unnecessary abstraction:** Create a shared abstraction when at least two real use cases need it, not merely because two components look vaguely similar.
8. **Frontend-only changes:** This specification does not authorize backend, database, API, or authentication-contract changes.
9. **Accessible by default:** Keyboard access, visible focus, semantic HTML, readable contrast, and touch targets are baseline requirements.
10. **Incremental implementation:** Audit the existing code before changing it. Preserve working components and adapters unless there is a clear reason to replace them.

### 1.2 Product scope: food, drinks, and hospitality only

Local Spot is deliberately **not** a general business directory. Its discovery universe is limited to food, beverages, dining, and accommodation/hospitality experiences.

**In-scope venue types**
- Cafés and coffee shops.
- Specialty coffee shops and coffee roasters.
- Restaurants and casual dining.
- Traditional Ethiopian restaurants and cultural kitchens.
- Bakeries and pastry shops.
- Dessert, ice cream, and sweet shops.
- Juice bars, smoothie shops, and non-alcoholic drink spots.
- Food vendors, takeaway spots, and food stalls.
- Hotels, boutique hotels, lodges, and guesthouses.
- Food-related culinary experiences, such as coffee ceremonies or organized dining experiences, only if the product/backend supports them.

**Out of scope**
- General retail and shopping.
- Clothing, electronics, and supermarkets as generic businesses.
- Gyms, fitness, wellness, spas, and medical services.
- Sports venues, sports clubs, and recreational facilities unrelated to food or hospitality.
- General professional services, offices, agencies, and repair services.
- Nightlife or alcohol-focused venues as a standalone category. A restaurant may still list its food and non-alcoholic drink offering; alcohol must not become a discovery category.
- Any unrelated business category simply because it exists in a generic places API.

If the backend returns a broad set of categories, the frontend must filter or map them to the approved Local Spot taxonomy. Do not expose unrelated categories in navigation, filters, category pages, onboarding, or homepage sections. Prefer fixing category mapping at the API adapter/presentation boundary rather than scattering hardcoded exclusions across components. Do not change the backend contract as part of frontend-only work.

### 1.3 Approved category taxonomy

Use this as the product-facing category vocabulary. Map these labels to the actual category IDs/slugs returned by the backend; do not assume the exact backend identifiers.

| Parent category | Product-facing subcategories |
|---|---|
| **Cafés & Coffee** | Cafés, Coffee Shops, Specialty Coffee, Coffee Roasters, Traditional Coffee Ceremony |
| **Restaurants & Dining** | Restaurants, Traditional Ethiopian Food, Cultural Dining, Local Food, Casual Dining, Family Dining |
| **Bakeries & Desserts** | Bakeries, Pastries, Cakes, Desserts, Ice Cream |
| **Juice & Drinks** | Juice Bars, Fresh Juice, Smoothies, Tea & Non-Alcoholic Drinks |
| **Street Food & Takeaway** | Street Food, Food Stalls, Takeaway, Quick Bites |
| **Hotels & Stays** | Hotels, Boutique Hotels, Lodges, Guesthouses, Food-and-Stay Experiences |

**Category behavior**
- A venue may belong to more than one relevant category when the backend supports multiple categories.
- Categories must describe what the venue offers, not unsupported quality claims.
- “Open Now” is a filter/status, not a venue category.
- Neighborhoods such as Bole, Kazanchis, Piassa, Sarbet, CMC, Ayat, and Bishoftu are geographic filters, not categories.
- “Trending”, “Top Rated”, and “Featured” are editorial/ranking labels, not categories. Use them only when backed by real ranking or editorial data.
- Do not create separate categories for wellness, sports, shopping, or unrelated services.
- Keep category names concise and understandable. Avoid duplicate labels such as both “Coffee” and “Coffee Shops” unless the backend taxonomy requires a clear distinction.

### 1.4 Architectural style

Use a **feature-oriented modular frontend** with a small shared foundation.

The frontend is not required to reproduce the Laravel backend folder structure exactly. Frontend modules should be organized around user-facing capabilities and the data they own. Where a frontend feature corresponds to a backend domain, keep that relationship clear without creating artificial one-to-one folders.

---

## 2. High-level application architecture

```text
React Application
│
├── App Core
│   ├── App entry and providers
│   ├── Router and route definitions
│   ├── Global error handling
│   └── Application configuration
│
├── Layouts
│   ├── RootLayout
│   └── AuthLayout
│
├── Features
│   ├── places
│   ├── discovery
│   ├── bookmarks
│   ├── reviews
│   ├── auth
│   └── owner                 # only where supported by the existing product/API
│
├── Shared
│   ├── UI primitives
│   ├── Common components
│   ├── Map components
│   ├── Hooks
│   ├── Utilities
│   ├── Types and API contracts
│   └── Design tokens
│
├── API Infrastructure
│   ├── Axios client
│   ├── Error parsing
│   └── Shared request configuration
│
└── State Infrastructure
    ├── TanStack Query
    ├── Zustand stores
    └── URL state
```

### 2.1 Suggested folder structure

Adapt this structure to the current repository rather than moving files mechanically. The existing `api/`, `layouts/`, `components/`, `features/`, `pages/`, and `store/` organization can be retained while gradually aligning ownership.

```text
src/
├── app/
│   ├── App.tsx
│   ├── providers/
│   │   ├── AppProviders.tsx
│   │   └── QueryProvider.tsx
│   ├── router/
│   │   ├── index.tsx
│   │   └── routePaths.ts
│   └── config/
│       └── env.ts
│
├── layouts/
│   ├── RootLayout.tsx
│   └── AuthLayout.tsx
│
├── features/
│   ├── places/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── discovery/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── bookmarks/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── reviews/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── auth/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── types/
│   │   └── index.ts
│   │
│   └── owner/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── types/
│       └── index.ts
│
├── components/
│   ├── ui/                    # buttons, inputs, dialogs, badges, skeletons
│   ├── common/                # Header primitives, EmptyState, ErrorState, etc.
│   └── map/                   # reusable Leaflet primitives
│
├── hooks/                     # genuinely cross-feature hooks only
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   └── parseApiError.ts
│   ├── utils/
│   └── constants/
│
├── store/                     # small global client state only
├── styles/
│   ├── tokens.css
│   └── globals.css
│
├── types/                     # only globally shared types
└── assets/
    ├── images/
    ├── fonts/
    └── icons/
```

**Folder ownership rule:** If a component, hook, type, or API function is used only by one feature, keep it inside that feature. Move it to `components/`, `hooks/`, `lib/`, or global `types/` only when it is genuinely shared.

### 2.2 Dependency direction

Allowed dependency direction:

```text
app / layouts / pages
        ↓
feature modules
        ↓
shared components, hooks, utilities, API infrastructure
```

Rules:

- A feature may import shared components and utilities.
- A feature should not reach into another feature's private files.
- Cross-feature use must go through that feature's public `index.ts` exports, or through a neutral shared contract when appropriate.
- Shared components must not import feature modules.
- Avoid circular dependencies.
- The app/router layer may import feature pages through public exports.
- Do not create a generic service layer that simply forwards calls without adding value.

---

## 3. Module responsibilities

### 3.1 `places` module

**Purpose:** Present an individual eligible food, drink, or accommodation venue and its available information. In Local Spot, a place means a café, restaurant, coffee shop/roaster, bakery, dessert or juice shop, food vendor, hotel, lodge, or another explicitly food-and-hospitality-related venue. It does not mean any arbitrary local business.

Owns:
- Place detail page and page-level loading/error states.
- Place profile sections: overview, gallery, operating hours, location, menu, and contact details.
- Place data types and place-specific API functions.
- Place-specific hooks.
- Place card family if the card's data and behavior are place-domain-specific.

Main components:
- `PlaceCard`
- `PlaceGallery`
- `PlaceHero`
- `PlaceOverview`
- `OperatingHours`
- `PlaceLocation`
- `PlaceMenu`
- `PlaceContactActions`

Main page:
- `PlaceDetailPage`

Responsibilities:
- Render only fields actually returned by the API.
- Hide absent ratings, review counts, menu prices, hours, and contact details.
- Display representative photography honestly when it is not an owner-uploaded image.
- Use the existing place slug route and current API contract.

### 3.2 `discovery` module

**Purpose:** Help users find places through browsing, categories, search, maps, and proximity.

Owns:
- Homepage discovery feed.
- Search page and URL-synchronized filters.
- Nearby page and geolocation interaction.
- Category browsing.
- Trending, latest additions, curated collections, and neighborhood sections only where real data or approved editorial configuration exists.
- Discovery API functions, hooks, and types.

Main components:
- `HomeHero`
- `QuickFilters`
- `TrendingSection`
- `LatestPlacesSection`
- `NeighborhoodSection`
- `CollectionCard`
- `SearchBar`
- `SearchFilters`
- `SearchResults`
- `DiscoveryMap`
- `NearbyControls`
- `FeaturedPlace`

Main pages:
- `HomePage`
- `SearchPage`
- `NearbyPage`
- `CategoryPage` (if category routes exist)

Responsibilities:
- Keep search/filter state in the URL when it should be shareable or survive refresh.
- Use backend discovery results rather than hardcoded fake data.
- Request browser geolocation only after a clear user action or an understandable permission explanation.
- Provide a useful fallback when location permission is denied.
- Do not label results as trending or top-rated unless the backend or a documented editorial source provides that ranking.

### 3.3 `bookmarks` module

**Purpose:** Let authenticated users save and revisit places.

Owns:
- Bookmark API functions and mutations.
- Bookmark query hooks.
- Saved places page and bookmark-specific UI.
- Optimistic updates only when rollback and cache consistency are handled correctly.

Main components:
- `BookmarkButton`
- `SavedPlacesList`
- `BookmarkEmptyState`

Main page:
- `BookmarksPage`

Responsibilities:
- Keep bookmark state synchronized with TanStack Query.
- Prevent a bookmark click inside a card from triggering card navigation.
- Show authentication requirements clearly when bookmarking requires a signed-in user.
- Do not maintain a second, conflicting copy of server bookmark state in Zustand.

### 3.4 `reviews` module

**Purpose:** Display and manage reviews only to the extent supported by the current backend.

Owns:
- Review list and review form, if available.
- Review API functions, types, and hooks.
- Review-specific validation and states.

Main components:
- `ReviewList`
- `ReviewCard`
- `ReviewForm`
- `ReviewSummary`

Main page:
- A dedicated reviews page only if the product has a real route and use case. Otherwise, compose review components into `PlaceDetailPage`.

Rules:
- Never fabricate review totals, average ratings, or review content.
- Hide empty review summaries rather than rendering invented values.
- Do not assume review creation, editing, reporting, or moderation endpoints exist. Confirm the current API first.

### 3.5 `auth` module

**Purpose:** Handle user authentication and account entry flows.

Owns:
- Login, registration, forgot-password, and reset-password pages where supported.
- Auth API calls and auth-specific types.
- Auth form components and validation.
- Auth state transitions and route guards.

Main components:
- `LoginForm`
- `RegisterForm`
- `ForgotPasswordForm`
- `ResetPasswordForm`
- `GoogleSignInButton` (only if OAuth is configured and supported)

Main pages:
- `LoginPage`
- `RegisterPage`
- `ForgotPasswordPage`
- `ResetPasswordPage`

Rules:
- Preserve the current Laravel Sanctum/token contract. Do not change backend authentication behavior from frontend work.
- Keep secrets out of client-side source code.
- Redirect to the intended route after authentication when a valid intended route exists.
- Handle expired or invalid sessions through the shared API error/auth flow.

### 3.6 `owner` module

**Purpose:** Provide owner-facing place management only for capabilities that already exist in the backend and product scope.

Possible ownership:
- Owner place management pages.
- Place image upload UI.
- Menu and operating-hour management UI.
- Owner-specific API functions and hooks.

Do not implement a dashboard, analytics, image moderation, or management workflow merely because it appears in a design concept. First verify that the route, permissions, and backend endpoints exist.

---

## 4. Shared application foundation

### 4.1 App core and providers

`AppProviders` should compose the providers required by the application, such as:

- TanStack Query client provider.
- Router provider, if not already mounted at the entry point.
- Authentication/session provider only if the current implementation requires one.
- Theme provider only if multiple themes are genuinely supported. This specification currently defines one dark theme.

Keep provider setup centralized. Do not instantiate a new QueryClient on every render.

### 4.2 API infrastructure

Use one configured Axios client for common concerns:

- API base URL from validated environment configuration.
- Shared headers and token handling consistent with the existing Sanctum setup.
- Request/response interceptors only for genuinely global behavior.
- Centralized `parseApiError` handling.
- Consistent timeout and network failure behavior.

Feature modules own their endpoint-specific API functions:

```text
features/
  places/api/placesApi.ts
  discovery/api/discoveryApi.ts
  bookmarks/api/bookmarksApi.ts
  auth/api/authApi.ts
```

Do not put every endpoint in one large `api.ts` file. Do not create endpoint functions for routes that have not been verified in the backend.

### 4.3 State ownership

| State category | Owner | Examples |
|---|---|---|
| Remote server data | TanStack Query | Places, categories, reviews, bookmarks, hours |
| Shareable navigation state | URL search params | Search query, category, sort, radius, view mode |
| Small global client state | Zustand | Auth session summary, global UI state if needed |
| Local interaction state | React state | Open dialog, selected gallery image, expanded section |
| Persistent preferences | Existing persistence mechanism, only when needed | User-selected display preference |

Rules:
- Do not copy query results into Zustand.
- Do not duplicate URL filter state in a global store.
- Keep state as close as possible to the component that uses it.
- Query keys must be stable and feature-owned.
- Mutations must invalidate or update the relevant query caches.

### 4.4 Routing

Centralize route paths and route definitions. Use layouts to compose shared shells.

Suggested route map, subject to routes that actually exist:

```text
/                         HomePage
/search                   SearchPage
/nearby                   NearbyPage
/categories/:slug         CategoryPage
/places/:slug             PlaceDetailPage
/saved                    BookmarksPage
/login                    LoginPage
/register                 RegisterPage
/forgot-password          ForgotPasswordPage
/reset-password           ResetPasswordPage
```

Do not add routes for unsupported features. Place detail can use a headerless immersive layout mode while the rest of the public application uses `RootLayout`.

---

## 5. Design system

### 5.1 Visual identity

The visual direction is **dark obsidian editorial**, with cinematic photography and restrained monochrome controls.

Core rules:

- The page canvas is deep charcoal, not pure black.
- Use layered surfaces to establish depth.
- Photography carries most of the visual emotion.
- Text and controls remain readable over photography through directional gradients.
- White and translucent white are the primary interaction colors.
- Do not introduce arbitrary gold, amber, or warm-brown interface accents.
- Do not use decorative badges to imply trust, verification, popularity, or quality without data.

### 5.2 Color tokens

| Token | Value | Usage |
|---|---|---|
| `--background` | `#0D0D0C` | Root canvas |
| `--surface` | `#151513` | Cards, panels, bars |
| `--surface-elevated` | `#1D1C19` | Menus, dialogs, elevated surfaces |
| `--border-subtle` | `#34322D` | Quiet dividers and card borders |
| `--border-defined` | `rgba(255,255,255,0.20)` | Glass borders and inactive controls |
| `--border-active` | `#FFFFFF` | Selected controls and focus |
| `--foreground` | `#F5F2EA` | Primary text |
| `--muted-foreground` | `#AAA69C` | Supporting text and metadata |
| `--accent-status` | `#2E8555` | Open-now status only when appropriate |
| `--accent-destructive` | `#E05252` | Errors and destructive actions |

**Accent clarification:** Green is a semantic status color, not a general brand accent. Use it sparingly for a genuine live status such as "Open now". A verified badge must not be shown unless verification data is explicitly supplied by the backend. If strict monochrome consistency is preferred, render status with text and a neutral indicator instead.

### 5.3 Typography

Use three roles:

**Display:** Plus Jakarta Sans, weights 800–900.
- Hero headline: `text-3xl sm:text-5xl lg:text-6xl`
- Section heading: `text-xl sm:text-2xl`
- Card title: `text-base sm:text-lg`

**Interface/body:** Inter, weights 400–600.
- Body: `text-sm sm:text-base leading-relaxed`
- Supporting text: `text-xs sm:text-sm`
- Pills: `text-xs font-semibold`

**Technical metadata:** Inter or a monospace font.
- Coordinates, distance, hours, and prices.
- Keep metadata legible and avoid using monospace for long body copy.

Load font files efficiently and provide sensible fallback fonts.

### 5.4 Photography and overlays

For text placed over images, use a reusable utility:

```css
.text-border-letters {
  -webkit-text-stroke: 0.3px rgba(0, 0, 0, 0.7);
  paint-order: stroke fill;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}
```

Use image gradients as the primary contrast mechanism. The text-stroke utility is supplementary, not a substitute for a proper overlay.

### 5.5 Reusable surface recipes

**Floating glass container**

```text
rounded-3xl border border-white/20
bg-[#121210]/55
shadow-[0_16px_40px_0_rgba(0,0,0,0.6)]
backdrop-blur-2xl
```

**Frosted input**

```text
h-11 rounded-full border border-white/15
bg-black/40 px-4
text-xs font-mono text-[#F5F2EA]
placeholder:text-[#AAA69C]/60
backdrop-blur-md
focus:border-white focus:outline-none
```

**Monochrome action pill**

```text
rounded-full border border-white
bg-transparent px-4 py-2
text-xs font-bold text-white
hover:bg-white/10 active:scale-95
transition-all
```

**Translucent navigation pill**

```text
rounded-full border border-white/20
bg-black/35 px-3.5 py-1
text-xs font-mono text-[#AAA69C]
hover:text-[#F5F2EA] hover:border-white/50
backdrop-blur-md
```

**Bookmark icon button**

```text
h-11 w-11 rounded-full
border border-[#34322D]
bg-[#151513]/75 text-white
hover:border-white active:scale-95
backdrop-blur-md shadow-md
```

The visual target may use a smaller icon glyph inside the 44px interactive target. Do not make the actual touch target smaller than the accessibility requirement.

---

## 6. Layout and navigation modules

### 6.1 `RootLayout`

Owns the public discovery shell:

- Global navigation.
- Main route outlet.
- Footer.
- Mobile bottom navigation.
- Global toast/notification region, if already used.

The layout should not own feature data fetching or page-specific business logic.

### 6.2 `Navbar`

The navbar supports three behaviors:

**Homepage at top**
- Transparent background.
- Gradient underlay for legibility.
- No visible bottom border.
- Hero image continues behind the navigation.

**Scrolled state or secondary page**
- `bg-[#0D0D0C]/95`
- `backdrop-blur-md`
- Subtle bottom border and shadow.

**Scroll direction**
- Scrolling down beyond the configured threshold hides the navbar.
- Scrolling up reveals it.
- Near the top, visibility is locked on.
- Disable or simplify this behavior when a menu, dialog, or keyboard interaction makes hiding disruptive.
- Respect reduced-motion preferences.

The navbar should be a shared layout component, not duplicated inside individual pages.

### 6.3 Navigation information architecture

Keep navigation simple and consistent with the implemented product.

Desktop primary navigation:
- Explore
- Categories
- Map
- Saved
- Account

Mobile primary navigation:
- Explore
- Search
- Saved
- Profile

Do not show a navigation destination unless the route and feature are functional. Avoid duplicating the same action in several navigation rows without a clear usability reason.

### 6.4 `AuthLayout`

Owns the authentication shell and shared background presentation.

- Fixed background image may use an Ethiopian food photograph.
- Background must not shift between auth route transitions.
- Keep the image decorative and non-interactive.
- Use a dark overlay to preserve form contrast.
- Desktop may use a split-screen composition with a glass form panel and a concise cultural message.
- Mobile should prioritize the form and avoid forcing a two-column layout.

Use `/assets/bozena-shiro.jpg` only if that asset exists and its source/usage is appropriate. Otherwise use an available approved asset. Do not assume the file exists.

---

## 7. Page composition specifications

Pages should compose feature-owned sections. Avoid building the entire homepage, search page, or detail page as one monolithic component.

### 7.1 Homepage

The homepage is an editorial entry point into local discovery. It should be image-first but not overloaded.

**Recommended homepage hierarchy: four primary sections**

1. Full-bleed featured place hero.
2. Quick discovery filters.
3. Curated discovery feed (combine genuinely useful trending/latest/category content into a manageable section).
4. Neighborhoods or collections.

A floating "Near Me" shortcut may remain as a utility if it does not obscure content or compete with the main actions.

This is a deliberate simplification of the earlier eight listed homepage movements. The previous specification described "7 distinct visual movements" but actually listed eight. The revised structure resolves that inconsistency and avoids making the homepage feel like a streaming-service clone with too many competing shelves.

#### A. Full-bleed featured hero

- Large, edge-to-edge food or place photograph.
- Straight rectangular outer edges.
- Image extends behind the transparent homepage navbar.
- Top gradient protects navigation contrast.
- Bottom gradient supports featured place text.
- Featured content includes only verified place data:
  - Category, if available.
  - Place name.
  - Rating, only if present.
  - Neighborhood/location, if present.
  - Link to the place detail page.

The hero image and featured place must be connected deliberately. Do not show a photograph of one venue while linking to a different venue.

**Featured content source:** Use an existing API response or a clearly maintained editorial configuration. Do not invent a "featured" backend endpoint or hardcode fake business data.

#### B. Quick filters

Possible filters, only when supported:
- All
- Open Now
- Bole
- Kazanchis
- Bishoftu Lakes
- Specialty Cafes
- Cultural Dining
- Lakeside Stays

Use horizontally scrollable pills on mobile. Active state uses a white border and restrained translucent fill.

#### C. Curated discovery feed

Combine available discovery sections into a clear hierarchy. Potential content:
- Trending or popular places, only when a real ranking exists.
- Latest additions, only when creation dates or a reliable feed are available.
- Category-based recommendations.
- Editorially selected places.

Do not render empty shelves just to preserve a visual template. A section should disappear or show a useful empty state when there is no data.

#### D. Neighborhoods and collections

Neighborhoods may include Bole, Kazanchis, Piassa, Sarbet, CMC, Ayat, and Bishoftu.

- Use real place images for collection previews.
- Use a fanned image stack only when multiple actual images are available.
- Do not fabricate place counts, save counts, or popularity statistics.
- Link each item to a real filtered discovery route or collection page.

#### Optional: Near Me shortcut

- Fixed near the lower-right edge, with safe spacing from mobile navigation.
- Uses a subtle live-style indicator only if it communicates a real state.
- Opens `/nearby`.
- Any first-visit tooltip must be dismissible and must not repeatedly interrupt the user.

### 7.2 Place detail page: `/places/:slug`

Use an immersive, headerless presentation when the route is active. The place detail page owns its content; the root layout may expose a layout mode or route metadata to suppress the global navbar.

**A. Immersive hero**
- Approximate desktop height: 540–660px.
- Full-width venue photography.
- Floating back and share controls.
- Gallery controls only when multiple images exist.
- Bottom information overlay:
  - Place name.
  - Category if present.
  - Genuine rating if present.
  - Current open status only when the operating-hours data supports calculation.
  - Location/area if present.
  - Actions that are supported by available contact/location data.

**B. Editorial information**

1. About and atmosphere.
2. Image gallery.
3. Weekly operating schedule.
4. Location and map.
5. Menu and offerings.
6. Additional information and contact methods.

Hide sections with no data rather than filling them with placeholders.

**C. Mobile sticky action dock**
- Fixed to the bottom with safe-area padding.
- Prioritize Directions and Call when the relevant data exists.
- Do not render inactive or unavailable actions.
- Ensure the dock does not cover the final page content.

**Interaction rules**
- Back action uses browser history when meaningful; provide a safe fallback to the discovery page when the detail page was opened directly.
- Gallery controls must be keyboard accessible.
- Share uses the Web Share API when available and a copy-link fallback otherwise.
- Directions requires valid coordinates or an address.
- Call requires a valid phone number.
- WhatsApp requires a valid phone/contact value and a correctly constructed link. Do not invent contact details.

### 7.3 Search page: `/search`

Search state that should survive refresh or be shareable belongs in URL parameters.

Potential URL parameters, only where supported:
- `q`
- `category`
- `open_now`
- `sort_by`
- `radius`
- `view`

Presentation:
- Search input and compact filters.
- Grid/list results with skeleton loading.
- Map view with interactive markers.
- Clear empty, loading, and error states.

Rules:
- Keep URL parameters synchronized with visible controls.
- Avoid duplicate state in Zustand.
- Show distance only when the user location and place coordinates are available.
- Do not claim exact distance when only an approximate location is known.
- Map and grid must represent the same filtered result set.

### 7.4 Nearby page: `/nearby`

Purpose: proximity-based discovery using the existing backend capability.

- Explain why location access is useful before requesting it.
- Offer a manual location fallback if geolocation is denied.
- Provide radius controls only when the backend supports the requested range.
- Show the user's selected search center clearly.
- Display distance only when returned or correctly calculated from valid coordinates.

Neighborhood presets may include:

| Area | Approximate coordinates |
|---|---|
| Bole | `9.0025, 38.7872` |
| Kazanchis | `9.0205, 38.7712` |
| Piassa | `9.0350, 38.7520` |
| CMC / Ayat | `9.0220, 38.8300` |
| Sarbet | `8.9980, 38.7390` |
| Bishoftu | `8.7520, 38.9860` |

Treat these as approximate search-center presets, not exact user locations or venue coordinates. Verify them before presenting them as precise map pins.

### 7.5 Authentication pages

Pages:
- Login
- Register
- Forgot password
- Reset password

Use the shared glassmorphic form system. Keep forms compact, readable, and keyboard accessible.

- Placeholder-led fields may be used, but every input still needs an accessible name. Use visually hidden labels or equivalent accessible labeling.
- Google OAuth appears only if configured and functional.
- Preserve the current API contract.
- Display validation errors beside the relevant fields.
- Maintain intended-route redirect behavior when available.

---

## 8. Component architecture

### 8.1 Place card family

Use one shared place card implementation with explicit variants where the content and interaction are genuinely shared.

Recommended variants:
- `default`
- `compact`
- `featured`
- `ranked`

Avoid separate card implementations that slowly drift apart. Keep existing adapters for legacy card names while migrating usages incrementally; remove adapters only after confirming there are no remaining imports.

**Standard card**
- Whole card links to the place detail page.
- Image-first layout.
- Standard landscape ratio around 16:11.
- Bottom gradient overlay.
- Place name.
- Genuine rating and review count only when available.
- Location/area only when available.
- Bookmark button in the top-right.

**Compact card**
- Horizontal layout.
- Small thumbnail.
- Name and concise metadata.
- Suitable for sidebars and dense search results.

**Featured card**
- Larger image-led layout.
- Used for the homepage hero or prominent editorial placement only when needed.
- Do not create a second data model just for the visual variant.

**Ranked card**
- 16:10 landscape image.
- Outlined SVG rank number only when an actual ranking position is supplied.
- Genuine rating/location metadata.

### 8.2 Bookmark interaction inside a card

The bookmark control must not trigger parent card navigation.

- Prevent default link navigation.
- Stop event propagation.
- Keep the button's accessible label/state updated.
- Show loading/disabled state during mutation.
- Handle unauthenticated behavior clearly.

### 8.3 Poster card

Use a 2:3 or 3:4 image ratio when a vertical editorial presentation adds value.

- Image at top.
- Metadata below the image.
- Bookmark control within the image area.
- Do not force poster cards into every feed. They are a visual variant, not a separate domain.

### 8.4 Collection card

- Neighborhood or collection title.
- Optional concise description.
- Preview stack built from actual place images.
- Count only when derived from real data.
- Avoid fabricated save counts, popularity numbers, or decorative star ratings.

### 8.5 Shared UI primitives

Shared UI should contain generic controls and visual primitives:
- Button
- IconButton
- Input
- SearchInput
- Badge
- Dialog/Modal
- Dropdown
- Tabs
- Skeleton
- Spinner
- Tooltip
- Toast
- EmptyState
- ErrorState

A component belongs here only if it is domain-neutral. `PlaceCard` is not a generic UI primitive.

---

## 9. Maps, geolocation, and external actions

### 9.1 Map components

Shared `components/map/` may own:
- Map container.
- Tile layer setup.
- Marker primitives.
- Popup primitives.
- Map loading/error state.

Feature modules own map composition:
- Discovery map owns search-result markers and map/grid synchronization.
- Nearby map owns proximity center and nearby results.
- Place detail owns the single-place map presentation.

### 9.2 Tile provider configuration

Use the currently configured Leaflet tile provider and its valid deployment configuration. Do not assume that a provider is keyless or that a development URL will work in production.

- Keep provider URLs and keys in environment configuration when required.
- Do not expose secret credentials in the browser bundle.
- Follow the provider's attribution and usage requirements.
- Provide a graceful fallback if tiles fail.

### 9.3 Geolocation

- Request permission in context, not automatically on every page load.
- Handle permission denied, timeout, unavailable position, and unsupported browser.
- Do not persist precise coordinates unnecessarily.
- Use manual area selection as a fallback.
- Distinguish user coordinates from neighborhood preset coordinates.

### 9.4 Directions, call, and WhatsApp

Render actions only when the relevant data exists.

- Directions: valid coordinates/address.
- Call: valid phone number.
- WhatsApp: valid contact number and supported action.
- Share: native share when available, copy link otherwise.

---

## 10. Data integrity and content rules

These rules apply across every module.

1. No invented ratings or review counts.
2. No fake verified badges.
3. No unsupported "popular", "trending", or "top-rated" labels.
4. No fabricated amenities, opening hours, prices, menu items, or contact details.
5. Hide unavailable metadata cleanly.
6. Distinguish representative/stock photography from owner-provided venue imagery.
7. Do not imply that a representative image is a verified photo of the specific business.
8. Use authentic Ethiopian food and place references accurately. Keep all discovery categories within cafés, coffee, restaurants, food, non-alcoholic drinks, hotels, lodges, and related hospitality; exclude wellness, sports, shopping, and unrelated businesses.
9. Do not hardcode sample businesses into production components.
10. Loading skeletons are temporary UI, not fake content.

Cultural references may include Bozena Shiro, tegabino, Jebena coffee, traditional wot, and Lake Babogaya, but copy should be accurate and respectful. Avoid treating every Ethiopian venue as interchangeable.

---

## 11. Accessibility, responsive behavior, and performance

### 11.1 Accessibility

- Minimum interactive target: 44px by 44px.
- Use semantic buttons and links.
- Every form field needs an accessible name.
- Maintain visible keyboard focus.
- Ensure keyboard operation for menus, dialogs, carousels, and maps where applicable.
- Maintain WCAG AA contrast for text.
- Do not communicate status using color alone.
- Respect `prefers-reduced-motion`.
- Provide meaningful image alt text; decorative images use empty alt text.

### 11.2 Responsive design

**Mobile**
- Touch-first controls.
- Horizontal swipe carousels.
- Bottom navigation.
- Sticky action bars only when useful.
- Safe-area padding.
- Avoid horizontal page overflow.

**Desktop**
- Wider discovery grids.
- Hover enhancements as progressive enhancement.
- More spacious editorial composition.
- Map and results split views where useful.

Navigation must remain usable without hover.

### 11.3 Performance

- Use appropriately sized responsive images.
- Lazy-load below-the-fold imagery.
- Prioritize the homepage hero image.
- Avoid layout shifts by reserving image dimensions/aspect ratios.
- Keep route-level code splitting where it provides a meaningful benefit.
- Avoid unnecessary global state subscriptions and repeated API calls.
- Use TanStack Query caching and stale-time settings intentionally.
- Avoid rendering large map instances when their view is inactive.

### 11.4 Motion

- Keep transitions short and purposeful.
- Use image scale/opacity transitions sparingly.
- Avoid excessive parallax or animation.
- Navbar hide/reveal must not cause content jumps.
- Disable non-essential animation for reduced-motion users.

---

## 12. Error, loading, and empty states

Every data-driven feature should account for:

- Initial loading.
- Background refetching.
- Empty result.
- API validation error.
- Authentication/authorization error.
- Network failure.
- Missing or deleted resource.
- Partial data.

Use shared `Skeleton`, `EmptyState`, and `ErrorState` components where appropriate, while keeping the message and recovery action feature-specific.

All API errors should be normalized through the existing shared error parser. Do not silently swallow failures or show raw server stack traces to users.

---

## 13. Quality gates and verification

Before considering a frontend change complete:

1. Run the repository's configured lint command.
2. Run TypeScript checks.
3. Run the production Vite build.
4. Run relevant frontend tests, if configured.
5. Test the affected route at mobile and desktop widths.
6. Test loading, empty, error, and success states.
7. Test keyboard navigation and focus visibility for changed interactions.
8. Confirm that no unsupported API endpoint or response field was introduced.
9. Confirm that no fabricated business data appears.
10. Review the final diff for unrelated changes.

Expected commands depend on the actual `package.json`. Do not invent scripts; inspect the repository and run the scripts that exist.

---

## 14. Implementation workflow for AI coding agents

Use this workflow whenever implementing or auditing the frontend.

### Stage 0: Read-only audit

Before editing:
- Inspect the existing folder structure.
- Read `package.json`, router setup, providers, API client, stores, and relevant feature files.
- Identify existing components and their usages.
- Identify actual backend API endpoints and response shapes from the existing frontend contracts or supplied backend documentation.
- Report reusable code, duplication, risks, and the smallest implementation plan.

Do not modify files during this stage.

### Stage 1: Agree on module ownership

For each proposed file, identify:
- Owning feature or shared layer.
- Responsibility.
- Public exports.
- Dependencies.
- Whether an existing component can be reused.

Do not move files simply to make the tree look cleaner.

### Stage 2: Implement one bounded change

- Work on one feature or coherent UI change at a time.
- Keep changes frontend-only unless explicitly authorized otherwise.
- Preserve current API contracts.
- Avoid unrelated refactoring.
- Do not add dependencies without explaining why they are needed.
- Do not generate placeholder business data.

### Stage 3: Verify

Run the relevant checks and inspect the diff. Report:
- Files changed.
- Behavior implemented.
- Existing behavior preserved.
- Commands run and results.
- Any assumptions or blockers.

### Stage 4: Stop at scope boundaries

Do not continue into the next module automatically. Wait for review before broadening the change.

---

## 15. Master system prompt for coding agents

```markdown
You are the Lead Frontend Architect and UI Engineer for Local Spot Ethiopia.

Build and maintain a modular, accessible, image-first local discovery frontend using the repository's existing React, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand, React Router, and Axios setup.

ARCHITECTURE
- Use feature-first modules: places, discovery, bookmarks, reviews, auth, and owner only where supported. The product scope is strictly cafés, coffee, restaurants, food, non-alcoholic drinks, hotels, lodges, and related hospitality. Do not add wellness, sports, shopping, or unrelated business categories.
- Keep domain-specific components, hooks, API functions, and types inside their owning feature.
- Keep generic UI primitives and infrastructure in shared folders.
- Prevent circular dependencies and cross-feature imports into private files.
- Pages compose feature components; avoid monolithic page components.
- TanStack Query owns remote server state.
- URL parameters own shareable search/filter state.
- Zustand is reserved for small global client state.
- Do not duplicate server data in Zustand.

VISUAL SYSTEM
- Use the dark obsidian palette: #0D0D0C, #151513, #1D1C19.
- Use restrained white/translucent controls and subtle borders.
- Do not introduce arbitrary gold, amber, or warm-brown UI accents.
- Use Plus Jakarta Sans for display headings and Inter for body/interface text.
- Let authentic photography carry the visual identity.
- Use gradients to maintain text contrast over images.
- Maintain responsive, touch-first layouts.

DATA INTEGRITY
- Never invent businesses, ratings, review counts, prices, hours, amenities, verification badges, or API fields.
- Hide unavailable data cleanly.
- Do not imply representative stock photography is an owner-uploaded image.
- Use only endpoints and capabilities verified in the existing backend contract.
- Do not change backend code, database schema, or API contracts during frontend tasks.

INTERACTION
- Maintain minimum 44px touch targets.
- Make controls keyboard accessible.
- Bookmark buttons inside cards must not trigger card navigation.
- Keep search and filters synchronized with the URL.
- Handle loading, empty, error, and partial-data states.
- Respect reduced-motion preferences and safe-area insets.

WORKFLOW
1. Start with a read-only audit.
2. Report the current architecture and the smallest safe implementation plan.
3. Implement one bounded change at a time.
4. Reuse existing components and preserve working adapters.
5. Do not refactor unrelated files or add dependencies without justification.
6. Run the repository's actual lint, type-check, test, and build scripts.
7. Summarize changed files, behavior, verification, and remaining issues.
8. Stop at the agreed scope boundary and wait for review.
```

---

## 16. Decisions and deliberate refinements in version 3.2

This revision makes the following architectural and product refinements to the original visual specification:

1. **Feature ownership is explicit.** Pages, API functions, hooks, types, and components are grouped by capability rather than accumulating in broad global folders.
2. **Shared and feature-specific components are separated.** Generic buttons and dialogs are shared; place cards and discovery sections remain owned by their feature.
3. **State responsibilities are clarified.** TanStack Query, Zustand, React local state, and URL parameters each have a defined role.
4. **The homepage is simplified to four primary sections.** The original document said seven movements but listed eight. The revised hierarchy reduces competing content shelves while retaining the cinematic hero and local discovery identity.
5. **The visual system is made internally consistent.** Emerald is restricted to genuine status communication, not used as a broad accent or an unsupported verification signal.
6. **The hero's featured venue must match its image and link.** Editorial prominence cannot override data integrity.
7. **Auth fields retain accessible labels.** Placeholder-only forms are not sufficient for accessibility.
8. **Navigation and route proposals are conditional.** A route or feature should appear only when it exists and works.
9. **Map provider configuration is treated as deployment configuration.** Provider keys, attribution, and usage restrictions must be respected.
10. **Implementation is staged.** Read-only audit first, then one bounded frontend change at a time.

### Non-goals

This document does not authorize:
- Backend or database changes.
- New API endpoints.
- New product features that are not already agreed.
- A wholesale rewrite or file relocation.
- Fabricated demo data in production UI.
- Installing new libraries without a concrete need.
- Implementing every visual section merely because it is listed as a possible pattern.

---

**End of specification — Local Spot Ethiopia Frontend Architecture v3.2.0**