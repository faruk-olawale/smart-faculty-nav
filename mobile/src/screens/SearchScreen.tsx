import React, { useCallback } from 'react';
import {
  View, StyleSheet, Text,
  TouchableOpacity, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSearch } from '../hooks/useSearch';
import { SearchBar } from '../components/search/SearchBar';
import { SearchResults } from '../components/search/SearchResults';
import { COLORS, SIZES } from '../constants/theme';
import type { SearchResult } from '../types';
import { useAppStore } from '../store/useAppStore';

export default function SearchScreen({ navigation }: any) {
  const {
    query, results, recentSearches,
    isSearching, search, selectResult, clearSearch,
  } = useSearch();

  const { buildings, setSelectedBuilding } = useAppStore();

  const handleSelect = useCallback((result: SearchResult) => {
    Keyboard.dismiss();
    selectResult(result);

    // Find building to show
    let targetBuildingId = result.buildingId || (result.type === 'building' ? result.id : null);
    if (targetBuildingId) {
      const building = buildings.find(b => b.id === targetBuildingId);
      if (building) {
        setSelectedBuilding(building);
        navigation.navigate('Map');
        return;
      }
    }

    // Navigate to map with coordinates
    if (result.latitude && result.longitude) {
      navigation.navigate('Map');
    }
  }, [buildings]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <Text style={styles.subtitle}>
          Find buildings, departments and labs
        </Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={query}
          onChangeText={search}
          onClear={clearSearch}
          isSearching={isSearching}
          autoFocus={false}
        />
      </View>

      {/* Results */}
      {(query.length >= 2 || recentSearches.length > 0) && (
        <View style={styles.resultsContainer}>
          <SearchResults
            results={results}
            recentSearches={recentSearches}
            query={query}
            onSelect={handleSelect}
          />
        </View>
      )}

      {/* Empty state */}
      {query.length < 2 && recentSearches.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Search KWASU FET</Text>
          <Text style={styles.emptyText}>
            Search for any building, department or facility
          </Text>

          {/* Quick suggestions */}
          <View style={styles.suggestions}>
            <Text style={styles.suggestionsTitle}>Quick Searches</Text>
            <View style={styles.chips}>
              {['Computer Science', 'Computer Lab', 'Lecture Hall', 'Library', 'Security'].map(s => (
                <TouchableOpacity
                  key={s}
                  style={styles.chip}
                  onPress={() => search(s)}
                >
                  <Text style={styles.chipText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SIZES.md,
    paddingTop: SIZES.md,
    paddingBottom: SIZES.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.textDim,
    fontSize: 14,
  },
  searchContainer: {
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.sm,
  },
  resultsContainer: {
    paddingHorizontal: SIZES.md,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: SIZES.xxl,
    paddingHorizontal: SIZES.xl,
  },
  emptyIcon: { fontSize: 48, marginBottom: SIZES.md },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: SIZES.sm,
  },
  emptyText: {
    color: COLORS.textDim,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SIZES.xl,
  },
  suggestions: { width: '100%' },
  suggestionsTitle: {
    color: COLORS.textDim,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SIZES.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  chip: {
    backgroundColor: COLORS.panel,
    borderRadius: 100,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '500',
  },
});
