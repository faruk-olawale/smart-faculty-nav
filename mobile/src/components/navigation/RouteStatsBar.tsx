import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

interface Props {
  distanceText: string;
  durationText: string;
  remainingDistance?: string;
  remainingTime?: string;
  hasArrived: boolean;
  onStop: () => void;
  onARMode: () => void;
}

export function RouteStatsBar({
  distanceText, durationText,
  remainingDistance, remainingTime,
  hasArrived, onStop, onARMode,
}: Props) {
  if (hasArrived) {
    return (
      <View style={[styles.container, styles.arrivedContainer]}>
        <Text style={styles.arrivedIcon}>🎉</Text>
        <View style={styles.arrivedText}>
          <Text style={styles.arrivedTitle}>You have arrived!</Text>
          <Text style={styles.arrivedSub}>Destination reached</Text>
        </View>
        <TouchableOpacity style={styles.stopBtn} onPress={onStop}>
          <Text style={styles.stopBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats */}
      <View style={styles.stats}>
        <StatItem
          value={remainingDistance || distanceText}
          label="Distance"
          color={COLORS.primary}
        />
        <View style={styles.divider} />
        <StatItem
          value={remainingTime || durationText}
          label="ETA"
          color={COLORS.warning}
        />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.arBtn}
          onPress={onARMode}
        >
          <Text style={styles.arBtnText}>📷 AR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.stopBtn}
          onPress={onStop}
        >
          <Text style={styles.stopBtnText}>✕ Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatItem({
  value, label, color,
}: {
  value: string; label: string; color: string;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.panel,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    gap: SIZES.md,
  },
  arrivedContainer: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderTopColor: '#10B981',
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
    gap: SIZES.md,
    alignItems: 'center',
  },
  statItem: { alignItems: 'center' },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  statLabel: {
    color: COLORS.textDim,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
  },
  actions: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  arBtn: {
    backgroundColor: COLORS.primaryDim,
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  arBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  stopBtn: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  stopBtnText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  arrivedIcon: { fontSize: 28 },
  arrivedText: { flex: 1 },
  arrivedTitle: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '700',
  },
  arrivedSub: {
    color: COLORS.textDim,
    fontSize: 12,
  },
});
