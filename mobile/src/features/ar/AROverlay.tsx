import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated,
  Dimensions, TouchableOpacity,
} from 'react-native';
import { COLORS, BUILDING_COLORS, BUILDING_EMOJIS } from '../../constants/theme';
import type { Building } from '../../types';

const { width: W, height: H } = Dimensions.get('window');

interface ARLocation {
  building: Building;
  distance: number;
  distanceText: string;
  relativeBearing: number;
  isDestination: boolean;
}

interface Props {
  locations: ARLocation[];
  onPress: (building: Building) => void;
}

export function AROverlay({ locations, onPress }: Props) {
  const FOV = 80;
  const MIN_GAP_DEG = 12;

  const visible = locations
    .filter(l => l.isDestination || Math.abs(l.relativeBearing) < 55)
    .sort((a, b) => {
      if (a.isDestination) return -1;
      if (b.isDestination) return 1;
      return a.distance - b.distance;
    })
    .slice(0, 6);

  const placedBearings = [];
  const spaced = visible.map(loc => {
    let b = loc.relativeBearing;
    for (const placed of placedBearings) {
      if (Math.abs(b - placed) < MIN_GAP_DEG) {
        b = b >= placed ? placed + MIN_GAP_DEG : placed - MIN_GAP_DEG;
      }
    }
    placedBearings.push(b);
    return { ...loc, relativeBearing: b };
  });

  return (
    <View style={styles.container} pointerEvents="box-none">
      {spaced.map(loc => (
        <ARLocationPin
          key={loc.building.id}
          location={loc}
          onPress={onPress}
        />
      ))}
    </View>
  );
}

function ARLocationPin({
  location, onPress,
}: {
  location: ARLocation;
  onPress: (b: Building) => void;
}) {
  const { building, distance, distanceText, relativeBearing, isDestination } = location;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const color = isDestination
    ? COLORS.primary
    : (BUILDING_COLORS[building.type] || '#7C3AED');
  const emoji = BUILDING_EMOJIS[building.type] || '📍';

  // How far left/right from centre (field of view ~80 degrees)
  const FOV = 80;
  const screenX = W / 2 + (relativeBearing / FOV) * W;

  // Vertical — closer = lower on screen
  const maxDist = 200;
  const normalized = Math.min(distance / maxDist, 1);
  const screenY = H * 0.15 + normalized * H * 0.3;

  // Only show if within view
  const inView = Math.abs(relativeBearing) < 55;
  const opacity = inView
    ? Math.max(0.4, 1 - Math.abs(relativeBearing) / 55)
    : 0;

  const arrived = distance < 8;

  // Entry animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: opacity,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity]);

  // Bounce for destination
  useEffect(() => {
    if (isDestination) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -12,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isDestination]);

  // Direction arrow based on bearing
  function getArrow(): string {
    if (arrived) return '✅';
    const b = relativeBearing;
    if (b > -10 && b < 10) return '⬆️';
    if (b >= 10 && b < 35) return '↗️';
    if (b >= 35 && b < 70) return '➡️';
    if (b >= 70) return '⤵️';
    if (b <= -10 && b > -35) return '↖️';
    if (b <= -35 && b > -70) return '⬅️';
    if (b <= -70) return '⤵️';
    return '⬆️';
  }

  function getDirectionText(): string {
    if (arrived) return 'You are here!';
    const b = relativeBearing;
    if (b > -15 && b < 15) return 'Straight ahead';
    if (b >= 15 && b < 45) return 'Slightly right';
    if (b >= 45) return 'Turn right';
    if (b <= -15 && b > -45) return 'Slightly left';
    if (b <= -45) return 'Turn left';
    return 'Straight ahead';
  }

  if (!inView && !isDestination) return null;

  const scale = isDestination
    ? 1.15
    : Math.max(0.7, 1 - distance / 300);

  return (
    <Animated.View
      style={[
        styles.pinContainer,
        {
          left: screenX - 70,
          top: screenY,
          opacity: fadeAnim,
          transform: [
            { translateY: Animated.add(translateY, bounceAnim) },
            { scale: pulseAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => onPress(building)}
        activeOpacity={0.85}
        style={styles.pinTouchable}
      >
        {/* Main direction arrow — big and visible */}
        <View style={[
          styles.arrowCircle,
          {
            backgroundColor: color + 'CC',
            borderColor: color,
            width: isDestination ? 64 : 52,
            height: isDestination ? 64 : 52,
            borderRadius: isDestination ? 32 : 26,
          }
        ]}>
          <Text style={[
            styles.arrowEmoji,
            { fontSize: isDestination ? 28 : 22 }
          ]}>
            {getArrow()}
          </Text>
        </View>

        {/* Info card below arrow */}
        <View style={[
          styles.infoCard,
          { borderColor: color + '99' },
          isDestination && { backgroundColor: 'rgba(0,229,192,0.18)' },
        ]}>
          {/* Building emoji + name */}
          <View style={styles.nameRow}>
            <Text style={styles.buildingEmoji}>{emoji}</Text>
            <Text style={styles.buildingName} numberOfLines={2}>
              {building.shortName || building.name}
            </Text>
          </View>

          {/* Direction instruction */}
          <Text style={[styles.directionText, { color }]}>
            {getDirectionText()}
          </Text>

          {/* Distance */}
          <View style={[styles.distanceRow, { backgroundColor: color + '33' }]}>
            <Text style={[styles.distanceValue, { color }]}>
              {arrived ? '✅ Arrived' : distanceText}
            </Text>
          </View>

          {/* Upstairs warning */}
          {building.floor && building.floor > 1 && (
            <Text style={styles.floorText}>⬆️ Floor {building.floor}</Text>
          )}

          {/* Destination badge */}
          {isDestination && (
            <View style={styles.destBadge}>
              <Text style={styles.destBadgeText}>🎯 YOUR DESTINATION</Text>
            </View>
          )}
        </View>

        {/* Vertical line connecting arrow to ground */}
        <View style={[styles.stem, { backgroundColor: color + '88' }]} />

        {/* Ground anchor dot */}
        <View style={[styles.groundAnchor, {
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
    inset: 0,
    pointerEvents: 'box-none',
  },
  pinContainer: {
    position: 'absolute',
    width: 140,
    alignItems: 'center',
  },
  pinTouchable: {
    alignItems: 'center',
    width: '100%',
  },
  arrowCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  arrowEmoji: {
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(5,14,31,0.90)',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1.5,
    width: '100%',
    gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  buildingEmoji: { fontSize: 14 },
  buildingName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
    lineHeight: 13,
  },
  directionText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  distanceRow: {
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  distanceValue: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  floorText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  destBadge: {
    backgroundColor: 'rgba(0,229,192,0.2)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginTop: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,229,192,0.4)',
  },
  destBadgeText: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stem: {
    width: 2,
    height: 16,
  },
  groundAnchor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
  },
});
