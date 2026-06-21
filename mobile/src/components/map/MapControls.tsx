import React from 'react';
import {
  View, TouchableOpacity, Text, StyleSheet, ActivityIndicator
} from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

interface Props {
  onLocateMe: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onEmergency: () => void;
  isLocating: boolean;
  isTracking: boolean;
}

export function MapControls({
  onLocateMe, onZoomIn, onZoomOut, onEmergency, isLocating, isTracking
}: Props) {
  return (
    <View style={styles.container}>
      {/* Locate Me */}
      <TouchableOpacity
        style={[styles.btn, isTracking && styles.btnActive]}
        onPress={onLocateMe}
      >
        {isLocating
          ? <ActivityIndicator size="small" color={COLORS.primary} />
          : <Text style={styles.btnIcon}>📍</Text>
        }
      </TouchableOpacity>

      {/* Zoom In */}
      <TouchableOpacity style={styles.btn} onPress={onZoomIn}>
        <Text style={styles.btnText}>+</Text>
      </TouchableOpacity>

      {/* Zoom Out */}
      <TouchableOpacity style={styles.btn} onPress={onZoomOut}>
        <Text style={styles.btnText}>−</Text>
      </TouchableOpacity>

      {/* Emergency */}
      <TouchableOpacity style={[styles.btn, styles.emergencyBtn]} onPress={onEmergency}>
        <Text style={styles.btnIcon}>🚨</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: SIZES.md,
    top: 120,
    gap: SIZES.sm,
  },
  btn: {
    width: 46,
    height: 46,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnActive: {
    backgroundColor: COLORS.primaryDim,
    borderColor: COLORS.primary,
  },
  emergencyBtn: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderColor: 'rgba(239,68,68,0.3)',
    marginTop: SIZES.sm,
  },
  btnIcon: { fontSize: 20 },
  btnText: {
    fontSize: 22,
    color: COLORS.text,
    fontWeight: '600',
  },
});
