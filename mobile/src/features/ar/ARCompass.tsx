import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

interface Props {
  heading: number;
  isAvailable: boolean;
}

const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export function ARCompass({ heading, isAvailable }: Props) {
  const dirIndex = Math.round(heading / 45) % 8;
  const dirLabel = DIRECTIONS[dirIndex];

  return (
    <View style={styles.container}>
      {/* Compass ring */}
      <View style={styles.ring}>
        <View style={[
          styles.needle,
          { transform: [{ rotate: `${heading}deg` }] }
        ]}>
          <View style={styles.needleNorth} />
          <View style={styles.needleSouth} />
        </View>
        <View style={styles.center} />
      </View>

      {/* Direction label */}
      <Text style={styles.direction}>{dirLabel}</Text>
      <Text style={styles.degrees}>{Math.round(heading)}°</Text>

      {!isAvailable && (
        <Text style={styles.unavailable}>GPS</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 2,
  },
  ring: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(5,14,31,0.85)',
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  needle: {
    width: 4,
    height: 40,
    alignItems: 'center',
    position: 'absolute',
  },
  needleNorth: {
    width: 4,
    height: 20,
    backgroundColor: '#EF4444',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  needleSouth: {
    width: 4,
    height: 20,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  center: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    position: 'absolute',
    zIndex: 2,
  },
  direction: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  degrees: {
    color: COLORS.textDim,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  unavailable: {
    color: COLORS.warning,
    fontSize: 9,
    fontWeight: '700',
  },
});
