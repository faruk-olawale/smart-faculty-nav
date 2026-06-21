import React, { useEffect, useRef } from 'react';
import {
  Animated, View, Text, StyleSheet,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { COLORS, SIZES, BUILDING_COLORS, BUILDING_EMOJIS } from '../../constants/theme';
import { getDirectionLabel, isInView } from '../../utils/arUtils';
import type { Building } from '../../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  building: Building;
  distance: number;
  distanceText: string;
  relativeBearing: number;
  screenX: number;
  isDestination: boolean;
  onPress: (building: Building) => void;
}

export function ARMarker({
  building, distance, distanceText,
  relativeBearing, screenX,
  isDestination, onPress,
}: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const inView = isInView(relativeBearing);
  const color = isDestination
    ? COLORS.primary
    : (BUILDING_COLORS[building.type] || COLORS.primary);
  const emoji = BUILDING_EMOJIS[building.type] || '📍';
  const direction = getDirectionLabel(relativeBearing);
  const arrived = distance < 10;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: inView ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: inView ? 1 : 0.8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [inView]);

  // Bounce animation for destination
  useEffect(() => {
    if (isDestination && inView) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      bounceAnim.setValue(0);
    }
  }, [isDestination, inView]);

  // Vertical position based on distance
  const verticalPos = Math.min(
    SCREEN_HEIGHT * 0.35,
    Math.max(SCREEN_HEIGHT * 0.15, SCREEN_HEIGHT * 0.3 - distance * 0.5)
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: screenX - 60,
          top: verticalPos,
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: bounceAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => onPress(building)}
        activeOpacity={0.85}
      >
        {/* Arrow pointing to direction */}
        <View style={styles.arrowContainer}>
          <Text style={[styles.arrow, { color }]}>
            {arrived ? '✅' : direction}
          </Text>
        </View>

        {/* Info card */}
        <View style={[
          styles.card,
          { borderColor: color + '88' },
          isDestination && styles.cardDestination,
        ]}>
          {/* Icon + Name */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardEmoji}>{emoji}</Text>
            <Text style={styles.cardName} numberOfLines={2}>
              {building.shortName || building.name}
            </Text>
          </View>

          {/* Distance */}
          <View style={[styles.distanceBadge, { backgroundColor: color + '33' }]}>
            <Text style={[styles.distanceText, { color }]}>
              {arrived ? 'You are here!' : distanceText}
            </Text>
          </View>

          {/* Floor info */}
          {building.floor && building.floor > 1 && (
            <View style={styles.floorBadge}>
              <Text style={styles.floorText}>⬆️ Floor {building.floor}</Text>
            </View>
          )}

          {/* Destination indicator */}
          {isDestination && !arrived && (
            <View style={styles.destinationBadge}>
              <Text style={styles.destinationText}>🎯 Destination</Text>
            </View>
          )}
        </View>

        {/* Connector line */}
        <View style={[styles.connector, { backgroundColor: color }]} />

        {/* Ground dot */}
        <View style={[styles.groundDot, {
          backgroundColor: color,
          shadowColor: color,
        }]} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 120,
    alignItems: 'center',
    zIndex: 10,
  },
  arrowContainer: {
    marginBottom: 4,
  },
  arrow: {
    fontSize: 28,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  card: {
    backgroundColor: 'rgba(5,14,31,0.88)',
    borderRadius: SIZES.radiusSm,
    padding: SIZES.sm,
    borderWidth: 1.5,
    gap: 4,
    minWidth: 110,
    maxWidth: 130,
    backdropFilter: 'blur(10px)',
  },
  cardDestination: {
    backgroundColor: 'rgba(0,229,192,0.15)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardEmoji: { fontSize: 14 },
  cardName: {
    color: '#E2EAF4',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
    lineHeight: 14,
  },
  distanceBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  floorBadge: {
    backgroundColor: 'rgba(245,158,11,0.2)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    alignSelf: 'flex-start',
  },
  floorText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '700',
  },
  destinationBadge: {
    backgroundColor: 'rgba(0,229,192,0.15)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    alignSelf: 'flex-start',
  },
  destinationText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '700',
  },
  connector: {
    width: 2,
    height: 20,
    alignSelf: 'center',
    opacity: 0.6,
  },
  groundDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'white',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
});
