import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView,
} from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import type { SearchResult } from '../../types';

const TYPE_ICONS: Record<string, string> = {
  building: '🏛️',
  faculty: '🎓',
  department: '📚',
};

const TYPE_COLORS: Record<string, string> = {
  building: COLORS.primary,
  faculty: COLORS.secondary,
  department: '#06B6D4',
};

interface Props {
  results: SearchResult[];
  recentSearches: SearchResult[];
  query: string;
  onSelect: (result: SearchResult) => void;
}

export function SearchResults({ results, recentSearches, query, onSelect }: Props) {
  const showRecent = query.length < 2 && recentSearches.length > 0;
  const showResults = query.length >= 2;
  const items = showResults ? results : (showRecent ? recentSearches : []);

  if (items.length === 0 && !showResults) return null;

  return (
    <View style={styles.container}>
      {/* Section label */}
      {showRecent && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>🕐 Recent Searches</Text>
        </View>
      )}
      {showResults && results.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No results for "{query}"</Text>
          <Text style={styles.emptyHint}>Try searching by department code (e.g. CSC, EEE)</Text>
        </View>
      )}

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {items.map((result, index) => (
          <ResultItem
            key={`${result.id}-${index}`}
            result={result}
            isRecent={showRecent}
            onPress={() => onSelect(result)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function ResultItem({
  result, isRecent, onPress,
}: {
  result: SearchResult;
  isRecent: boolean;
  onPress: () => void;
}) {
  const icon = isRecent ? '🕐' : (TYPE_ICONS[result.type] || '📍');
  const color = TYPE_COLORS[result.type] || COLORS.primary;

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      {/* Text */}
      <View style={styles.itemText}>
        <Text style={styles.itemName} numberOfLines={1}>
          {result.name}
        </Text>
        {result.subtitle && (
          <Text style={styles.itemSubtitle} numberOfLines={1}>
            {result.subtitle}
          </Text>
        )}
      </View>

      {/* Type badge */}
      <View style={[styles.typeBadge, { backgroundColor: color + '20' }]}>
        <Text style={[styles.typeText, { color }]}>
          {result.type.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.panel,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    maxHeight: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  sectionHeader: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  sectionLabel: {
    color: COLORS.textDim,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    paddingHorizontal: SIZES.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: SIZES.radiusSm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: { fontSize: 18 },
  itemText: { flex: 1 },
  itemName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemSubtitle: {
    color: COLORS.textDim,
    fontSize: 12,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  empty: {
    padding: SIZES.xl,
    alignItems: 'center',
    gap: SIZES.sm,
  },
  emptyIcon: { fontSize: 32 },
  emptyText: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  emptyHint: { color: COLORS.textDim, fontSize: 12, textAlign: 'center' },
});
