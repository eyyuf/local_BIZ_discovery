/**
 * Shared Category Simplification & Derivation Utility
 * Ensures consistent, familiar, universally understandable category names
 * across all Local Spot pages, cards, and filters.
 */

// Category terminology normalizer mapping marketing jargon to plain language
export function simplifyCategoryName(name) {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();

  // Restaurants
  if (
    lower.includes('cultural dining') ||
    lower.includes('fine dining') ||
    lower.includes('casual dining') ||
    lower.includes('gourmet food') ||
    lower.includes('culinary') ||
    lower.includes('dining & cafe') ||
    lower === 'dining' ||
    lower === 'traditional kitchen'
  ) {
    return 'Restaurants';
  }

  // Cafes
  if (
    lower.includes('specialty cafe') ||
    lower.includes('speciality cafe') ||
    lower.includes('specialty coffee') ||
    lower === 'coffee & cafe'
  ) {
    return 'Cafes';
  }

  // Bakeries
  if (lower.includes('artisan bakery') || lower.includes('artisanal bakery')) {
    return 'Bakeries';
  }

  // Fast Food
  if (
    lower.includes('quick service dining') ||
    lower.includes('quick service')
  ) {
    return 'Fast Food';
  }

  // Hotels
  if (
    lower.includes('boutique stay') ||
    lower.includes('boutique suites') ||
    lower.includes('lakeside stay') ||
    lower.includes('lakeside stays') ||
    lower === 'stays'
  ) {
    return 'Hotels';
  }

  return trimmed;
}

/**
 * Derives a clean, consistent category label for a place.
 * Prioritizes specific subcategories over generic root categories.
 */
export function getPlaceCategoryLabel(place) {
  // 1. Genuine API categories array
  if (place?.categories && Array.isArray(place.categories) && place.categories.length > 0) {
    // Prefer child subcategories (parent_id is not null) over generic root categories like "Food & Drink"
    const sub = place.categories.find(
      (c) => c && typeof c === 'object' && c.parent_id !== null && c.name
    );
    if (sub) {
      return simplifyCategoryName(sub.name);
    }

    const first = place.categories[0];
    const rawName = typeof first === 'object' ? first.name : first;
    if (rawName) {
      return simplifyCategoryName(rawName);
    }
  }

  // 2. Single category property
  if (place?.category) {
    const rawName = typeof place.category === 'object' ? place.category.name : place.category;
    if (rawName) {
      return simplifyCategoryName(rawName);
    }
  }

  // 3. Fallback based on slug or name using standard simplified categories
  const slug = (place?.slug || '').toLowerCase();
  const name = (place?.name || '').toLowerCase();

  if (slug.includes('bakery') || slug.includes('pastry') || slug.includes('crust') || name.includes('bakery') || name.includes('pastry')) {
    return 'Bakeries';
  }
  if (slug.includes('coffee') || slug.includes('roaster') || slug.includes('cafe') || name.includes('coffee') || name.includes('cafe')) {
    return 'Cafes';
  }
  if (slug.includes('resort') || slug.includes('hotel') || slug.includes('inn') || slug.includes('suites') || name.includes('hotel') || name.includes('resort')) {
    return 'Hotels';
  }
  if (slug.includes('spa') || slug.includes('wellness') || name.includes('spa')) {
    return 'Spas';
  }
  if (slug.includes('gym') || slug.includes('fitness') || slug.includes('athletic') || name.includes('gym')) {
    return 'Gyms';
  }
  if (slug.includes('coworking') || slug.includes('hub') || name.includes('coworking')) {
    return 'Coworking';
  }
  if (slug.includes('market') || slug.includes('leather') || slug.includes('jewelry') || slug.includes('textiles') || slug.includes('shopping')) {
    return 'Shopping';
  }
  if (
    slug.includes('fish') ||
    slug.includes('kitchen') ||
    slug.includes('bistro') ||
    slug.includes('grill') ||
    slug.includes('dining') ||
    slug.includes('restaurant') ||
    name.includes('kitchen') ||
    name.includes('bistro') ||
    name.includes('restaurant')
  ) {
    return 'Restaurants';
  }

  return 'Restaurants';
}
