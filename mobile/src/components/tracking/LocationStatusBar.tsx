import React from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

interface Props {
  isTracking: boolean;
  accuracyLabel: string | null;
  speed: string | null;
  remainingDistance: string | null;
  hasArrived: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function LocationStatusBar({
  isTracking,
  accuracyLabel,
  speed,
  remainingDistance,
  hasArrived,
  onStart,
  onStop,
}: Props) {
  if (hasArrived) {
    return (
      <View style={[styles.container, styles.arrivedContainer]}>
        <Text style={styles.arrivedText}>🎉 You have arrived!</Text>
        <TouchableOpacity style={styles.stopBtn} onPress={onStop}>
          <Text style={styles.stopBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isTracking) {
    return (
      <View style={styles.container}>
        <Text style={styles.offlineText}>📍 Location tracking off</Text>
        <TouchableOpacity style={styles.startBtn} onPress={onStart}>
          <Text style={styles.startBtnText}>Enable GPS</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.activeContainer]}>
      {/* Accuracy */}
      <View style={styles.item}>
        <Text style={styles.itemValue}>{accuracyLabel || '...'}</Text>
        <Text style={styles.itemLabel}>GPS Signal</Text>
      </View>

      <View style={styles.divider} />

      {/* Speed */}
      <View style={styles.item}>
        <Text style={[styles.itemValue, { color: COLORS.warning }]}>
          {speed || '0 km/h'}
        </Text>
        <Text style={styles.itemLabel}>Speed</Text>
      </View>

      {/* Remaining distance if navigating */}
      {remainingDistance && (
        <>
          <View style={styles.divider} />
          <View style={styles.item}>
            <Text style={[styles.itemValue, { color: COLORS.primary }]}>
              {remainingDistance}
            </Text>
            <Text style={styles.itemLabel}>Remaining</Text>
          </View>
        </>
      )}

      {/* Stop button */}
      <TouchableOpacity style={styles.stopBtn} onPress={onStop}>
        <Text style={styles.stopBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.panel,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SIZES.sm,
  },
  activeContainer: {
    backgroundColor: 'rgba(0,229,192,0.08)',
    borderTopColor: COLORS.primary,
  },
  arrivedContainer: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderTopColor: '#10B981',
    justifyContent: 'space-between',
  },
  item: { alignItems: 'center', flex: 1 },
  itemValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  itemLabel: {
    color: COLORS.textDim,
    fontSize: 10,
    marginTop: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  offlineText: {
    color: COLORS.textDim,
    fontSize: 13,
    flex: 1,
  },
  arrivedText: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '700',
  },
  startBtn: {
    backgroundColor: COLORS.primaryDim,
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs + 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  startBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  stopBtn: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs + 2,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  stopBtnText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '700',
  },
});
