import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

interface Props {
  instruction: string;
  distance: string | null;
  destinationName: string | null;
  hasArrived: boolean;
}

export function ARDirectionBanner({
  instruction, distance, destinationName, hasArrived,
}: Props) {
  const slideAnim = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [instruction]);

  if (hasArrived) {
    return (
      <Animated.View style={[
        styles.container,
        styles.arrivedContainer,
        { transform: [{ translateY: slideAnim }] },
      ]}>
        <Text style={styles.arrivedIcon}>🎉</Text>
        <View>
          <Text style={styles.arrivedTitle}>You have arrived!</Text>
          {destinationName && (
            <Text style={styles.arrivedSub}>{destinationName}</Text>
          )}
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ translateY: slideAnim }] },
    ]}>
      {/* Big instruction */}
      <View style={styles.instructionRow}>
        <Text style={styles.instructionText}>{instruction}</Text>
      </View>

      {/* Destination + distance */}
      {destinationName && distance && (
        <View style={styles.detailRow}>
          <Text style={styles.destName} numberOfLines={1}>
            📍 {destinationName}
          </Text>
          <View style={styles.distancePill}>
            <Text style={styles.distanceText}>{distance}</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(5,14,31,0.92)',
    borderRadius: SIZES.radius,
    borderWidth: 1.5,
    borderColor: 'rgba(0,229,192,0.3)',
    padding: SIZES.md,
    gap: SIZES.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  arrivedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
    borderColor: 'rgba(16,185,129,0.5)',
    backgroundColor: 'rgba(16,185,129,0.15)',
  },
  arrivedIcon: { fontSize: 32 },
  arrivedTitle: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: '800',
  },
  arrivedSub: {
    color: COLORS.textDim,
    fontSize: 13,
    marginTop: 2,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SIZES.sm,
    marginTop: 2,
  },
  destName: {
    color: COLORS.textDim,
    fontSize: 12,
    flex: 1,
  },
  distancePill: {
    backgroundColor: 'rgba(0,229,192,0.2)',
    borderRadius: 100,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,229,192,0.4)',
  },
  distanceText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
});
