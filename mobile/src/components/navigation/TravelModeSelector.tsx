import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import type { TravelMode } from '../../types';

const MODES: { id: TravelMode; icon: string; label: string; speed: string }[] = [
  { id: 'foot', icon: '🚶', label: 'Walk', speed: '~5 km/h' },
  { id: 'bike', icon: '🚲', label: 'Bike', speed: '~15 km/h' },
  { id: 'car', icon: '🚗', label: 'Car', speed: '~40 km/h' },
];

interface Props {
  selected: TravelMode;
  onSelect: (mode: TravelMode) => void;
}

export function TravelModeSelector({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {MODES.map(mode => (
        <TouchableOpacity
          key={mode.id}
          style={[
            styles.modeBtn,
            selected === mode.id && styles.modeBtnActive,
          ]}
          onPress={() => onSelect(mode.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.modeIcon}>{mode.icon}</Text>
          <Text style={[
            styles.modeLabel,
            selected === mode.id && styles.modeLabelActive,
          ]}>
            {mode.label}
          </Text>
          <Text style={styles.modeSpeed}>{mode.speed}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  modeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.xs,
    borderRadius: SIZES.radiusSm,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: 2,
  },
  modeBtnActive: {
    backgroundColor: COLORS.primaryDim,
    borderColor: COLORS.primary,
  },
  modeIcon: { fontSize: 20 },
  modeLabel: {
    color: COLORS.textDim,
    fontSize: 12,
    fontWeight: '600',
  },
  modeLabelActive: { color: COLORS.primary },
  modeSpeed: {
    color: COLORS.textDim,
    fontSize: 10,
  },
});
