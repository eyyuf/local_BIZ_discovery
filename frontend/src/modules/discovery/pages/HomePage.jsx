import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { discoveryApi } from '../api/discoveryApi';
import { HeroCard } from '../components/HeroCard';
import { TrendingSection } from '../components/TrendingSection';
import { LatestSection } from '../components/LatestSection';
import { PersonalizedRadar } from '../components/PersonalizedRadar';
import { TopRatedSection } from '../components/TopRatedSection';

export function HomePage() {
  const [searchParams] = useSearchParams();
  const activeFilter = searchParams.get('filter') || 'all';

  const [exploreSections, setExploreSections] = useState([]);
  const [heroPlace, setHeroPlace] = useState(null);
  const [allPlaces, setAllPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const sections = await discoveryApi.getExploreFeed();
        if (!isMounted) return;

        setExploreSections(sections || []);

        const popular = sections.find((s) => s.key === 'nearby_popular')?.places || [];
        const additions = sections.find((s) => s.key === 'new_additions')?.places || [];

        // Combine unique places
        const combinedMap = new Map();
        [...popular, ...additions].forEach((p) => {
          if (p && p.slug && !combinedMap.has(p.slug)) {
            combinedMap.set(p.slug, p);
          }
        });
        const combined = Array.from(combinedMap.values());
        setAllPlaces(combined);

        // Identify Crater Lake Traditional Habesha Kitchen for the Hero
        const craterLake =
          combined.find((p) => p.slug === 'crater-lake-traditional-kitchen') ||
          popular[0] ||
          null;

        setHeroPlace(craterLake);
      } catch (err) {
        console.error('Failed to load explore feed', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter places based on active navbar quick filter
  const filteredPlaces = useMemo(() => {
    if (!activeFilter || activeFilter === 'all') return allPlaces;

    return allPlaces.filter((place) => {
      const slug = (place?.slug || '').toLowerCase();
      const address = (place?.address || '').toLowerCase();
      const name = (place?.name || '').toLowerCase();

      if (activeFilter === 'open_now') {
        return place.is_open !== false;
      }
      if (activeFilter === 'bole') {
        return address.includes('bole') || slug.includes('bole');
      }
      if (activeFilter === 'kazanchis') {
        return address.includes('kazanchis') || slug.includes('kazanchis');
      }
      if (activeFilter === 'bishoftu') {
        return address.includes('bishoftu') || slug.includes('bishoftu');
      }
      if (activeFilter === 'cafes') {
        return (
          slug.includes('coffee') ||
          slug.includes('roaster') ||
          slug.includes('cafe') ||
          name.includes('coffee')
        );
      }
      if (activeFilter === 'cultural_dining') {
        return (
          slug.includes('kitchen') ||
          slug.includes('habesha') ||
          slug.includes('bistro') ||
          slug.includes('traditional') ||
          name.includes('habesha')
        );
      }
      if (activeFilter === 'lakeside_stays') {
        return (
          slug.includes('resort') ||
          slug.includes('inn') ||
          slug.includes('hotel') ||
          slug.includes('suites') ||
          address.includes('bishoftu')
        );
      }
      return true;
    });
  }, [allPlaces, activeFilter]);

  const trendingPlaces = filteredPlaces.slice(0, 10);
  const latestPlaces = filteredPlaces.length > 5 ? filteredPlaces.slice(3) : filteredPlaces;

  return (
    <div className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] pb-24 overflow-x-hidden">
      {/* 1. Full-Bleed Edge-to-Edge Hero (QuickFilters are now in Navbar) */}
      <HeroCard place={heroPlace} />

      {/* 2. Main Discovery Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 mt-8 sm:mt-12 relative z-20">
        {/* Trending Movement: Ranked 1–5 spots */}
        <TrendingSection places={trendingPlaces} />

        {/* Latest Movement: Horizontal carousel with category filters */}
        <LatestSection places={latestPlaces} />

        {/* Personalized Radar Movement: Curated taste banner */}
        <PersonalizedRadar />

        {/* Top Rated Movement: Carousel */}
        <TopRatedSection places={trendingPlaces} />
      </div>
    </div>
  );
}

export default HomePage;
