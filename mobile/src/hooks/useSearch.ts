import { useState, useCallback, useRef } from 'react';
import { searchApi } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import type { SearchResult } from '../types';

const MAX_RECENT = 5;
const DEBOUNCE_MS = 280;

export function useSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const {
    searchResults, setSearchResults,
    searchQuery, setSearchQuery,
    recentSearches, addRecentSearch,
    buildings,
  } = useAppStore();

  // Local fallback search through buildings
  function localSearch(q: string): SearchResult[] {
    const lower = q.toLowerCase();
    const results: SearchResult[] = [];

    buildings.forEach(b => {
      if (
        b.name.toLowerCase().includes(lower) ||
        b.type.toLowerCase().includes(lower) ||
        b.description?.toLowerCase().includes(lower)
      ) {
        results.push({
          id: b.id,
          name: b.name,
          type: 'building',
          subtitle: b.type.replace(/_/g, ' '),
          latitude: b.latitude,
          longitude: b.longitude,
        });
      }

      // Search inside departments
      b.departments?.forEach(d => {
        if (
          d.name.toLowerCase().includes(lower) ||
          d.code?.toLowerCase().includes(lower)
        ) {
          results.push({
            id: d.id,
            name: d.name,
            type: 'department',
            subtitle: b.name,
            latitude: b.latitude,
            longitude: b.longitude,
            buildingId: b.id,
          });
        }
      });
    });

    return results.slice(0, 8);
  }

  const search = useCallback((q: string) => {
    setSearchQuery(q);

    if (!q.trim() || q.length < 2) {
      setSearchResults([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setError(null);

      try {
        const res = await searchApi.query(q);
        if (res.data && res.data.length > 0) {
          setSearchResults(res.data);
        } else {
          // Fallback to local search
          setSearchResults(localSearch(q));
        }
      } catch {
        // Use local search when API unavailable
        setSearchResults(localSearch(q));
      } finally {
        setIsSearching(false);
      }
    }, DEBOUNCE_MS);
  }, [buildings]);

  const selectResult = useCallback((result: SearchResult) => {
    addRecentSearch(result);
    setSearchQuery('');
    setSearchResults([]);
    return result;
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    query: searchQuery,
    results: searchResults,
    recentSearches,
    isSearching,
    error,
    search,
    selectResult,
    clearSearch,
  };
}
