import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Building } from '../../types';
import { BUILDING_COLORS, BUILDING_EMOJIS } from '../../constants/theme';

interface Props {
  building: Building;
  isSelected: boolean;
  onPress: (building: Building) => void;
}

export function BuildingMarker({ building, isSelected, onPress }: Props) {
  const color = building.isEmergency
    ? '#EF4444'
    : BUILDING_COLORS[building.type] || '#00E5C0';
  const emoji = BUILDING_EMOJIS[building.type] || '📍';
  const size = isSelected ? 52 : 42;

  return (
    <Marker
      coordinate={{ latitude: building.latitude, longitude: building.longitude }}
      onPress={() => onPress(building)}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={false}
    >
      <View style={[styles.markerContainer, { width: size, height: size }]}>
        <View style={[
          styles.marker,
          {
            backgroundColor: color,
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: isSelected ? 3 : 2,
            shadowColor: color,
            shadowOpacity: isSelected ? 0.8 : 0.4,
            shadowRadius: isSelected ? 12 : 6,
            elevation: isSelected ? 10 : 5,
          }
        ]}>
          <Text style={[styles.emoji, { fontSize: isSelected ? 22 : 18 }]}>
            {emoji}
          </Text>
        </View>
        {building.isEmergency && (
          <View style={[styles.emergencyRing, { borderColor: color }]} />
        )}
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255,255,255,0.9)',
    shadowOffset: { width: 0, height: 4 },
  },
  emoji: {
    textAlign: 'center',
  },
  emergencyRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 100,
    borderWidth: 2,
    opacity: 0.5,
  },
});
