import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { UserLocation } from '../../types';
import { COLORS } from '../../constants/theme';

interface Props {
  location: UserLocation;
}

export function UserMarker({ location }: Props) {
  return (
    <Marker
      coordinate={{ latitude: location.lat, longitude: location.lng }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
    >
      <View style={styles.container}>
        <View style={styles.outerRing} />
        <View style={styles.innerDot} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,229,192,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(0,229,192,0.4)',
  },
  innerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    borderWidth: 2.5,
    borderColor: 'white',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
});
