import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import type { Building } from '../../types';

interface Props {
  destination: Building | null;
  distanceToDestination: string | null;
  nearestBuilding: Building | null;
  distanceToNearest: string | null;
  buildingCount: number;
  hasArrived: boolean;
}

export function ARHud({
  destination, distanceToDestination,
  nearestBuilding, distanceToNearest,
  buildingCount, hasArrived,
}: Props) {
  if (hasArrived && destination) {
    return (
      <View style={[styles.container, styles.arrivedContainer]}>
        <Text style={styles.arrivedEmoji}>🎉</Text>
        <View>
          <Text style={styles.arrivedTitle}>You have arrived!</Text>
          <Text style={styles.arrivedSub}>{destination.name}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Destination */}
      {destination && distanceToDestination && (
        <View style={styles.destinationRow}>
          <Text style={styles.destinationLabel}>DESTINATION</Text>
          <Text style={styles.destinationName} numberOfLines={1}>
            {destination.shortName || destination.name}
          </Text>
          <Text style={styles.destinationDistance}>
            {distanceToDestination}
          </Text>
        </View>
      )}

      {/* Nearest building */}
      {nearestBuilding && distanceToNearest && (
        <View style={styles.nearestRow}>
          <Text style={styles.nearestLabel}>📍 NEAREST</Text>
          <Text style={styles.nearestName} numberOfLines={1}>
            {nearestBuilding.shortName || nearestBuilding.name}
          </Text>
          <Text style={styles.nearestDistance}>{distanceToNearest}</Text>
        </View>
      )}

      {/* Building count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          🏛️ {buildingCount} locations visible
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(5,14,31,0.85)',
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: 'rgba(0,229,192,0.2)',
    padding: SIZES.md,
    gap: SIZES.sm,
  },
  arrivedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderColor: 'rgba(16,185,129,0.4)',
  },
  arrivedEmoji: { fontSize: 28 },
  arrivedTitle: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '700',
  },
  arrivedSub: {
    color: COLORS.textDim,
    fontSize: 12,
  },
  destinationRow: {
    gap: 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SIZES.sm,
  },
  destinationLabel: {
    color: COLORS.textDim,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  destinationName: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  destinationDistance: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  nearestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  nearestLabel: {
    color: COLORS.textDim,
    fontSize: 9,
    fontWeight: '600',
  },
  nearestName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  nearestDistance: {
    color: COLORS.warning,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  countRow: {},
  countText: {
    color: COLORS.textDim,
    fontSize: 11,
    fontFamily: 'monospace',
  },
});
