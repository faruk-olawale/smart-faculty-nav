import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, ScrollView, Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCompass } from '../hooks/useCompass';
import { useGPSTracking } from '../hooks/useGPSTracking';
import { AROverlay } from '../features/ar/AROverlay';
import { ARCompass } from '../features/ar/ARCompass';
import { ARDirectionBanner } from '../features/ar/ARDirectionBanner';
import { useAppStore } from '../store/useAppStore';
import {
  calculateBearing,
  calculateDistance,
  formatARDistance,
  getRelativeBearing,
} from '../utils/arUtils';
import { COLORS, SIZES, BUILDING_EMOJIS } from '../constants/theme';
import { FACULTY_ICT } from '../constants';
import type { Building } from '../types';

const { width: W, height: H } = Dimensions.get('window');

interface ARData {
  building: Building;
  distance: number;
  distanceText: string;
  bearing: number;
  relativeBearing: number;
  isDestination: boolean;
}

export default function ARScreen({ route, navigation }: any) {
  const destination: Building | undefined = route?.params?.destination;
  const [permission, requestPermission] = useCameraPermissions();
  const [arData, setArData] = useState<ARData[]>([]);
  const [hasArrived, setHasArrived] = useState(false);
  const [showList, setShowList] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState('Point your camera to see directions');

  const { heading, isAvailable: compassAvailable } = useCompass();
  const { startTracking, isTracking } = useGPSTracking();
  const { buildings, userLocation } = useAppStore();

  // Demo location if GPS not available — memoized so it's not a new
  // object reference on every render (this was causing the infinite loop)
  const effLat = userLocation?.lat ?? FACULTY_ICT.latitude;
  const effLng = userLocation?.lng ?? FACULTY_ICT.longitude;
  const effectiveLocation = useMemo(
    () => ({ lat: effLat, lng: effLng }),
    [effLat, effLng]
  );

  // Init
  useEffect(() => {
    async function init() {
      if (!permission?.granted) await requestPermission();
      if (!isTracking) await startTracking();
    }
    init();
  }, []);

  // Compute AR data
  useEffect(() => {
    if (buildings.length === 0) return;

    const computed: ARData[] = buildings
      .map(b => {
        const distance = calculateDistance(
          effectiveLocation.lat, effectiveLocation.lng,
          b.latitude, b.longitude
        );
        const bearing = calculateBearing(
          effectiveLocation.lat, effectiveLocation.lng,
          b.latitude, b.longitude
        );
        const relativeBearing = getRelativeBearing(heading, bearing);

        return {
          building: b,
          distance,
          distanceText: formatARDistance(distance),
          bearing,
          relativeBearing,
          isDestination: destination?.id === b.id,
        };
      })
      .sort((a, b) => {
        // Destination always first
        if (a.isDestination) return -1;
        if (b.isDestination) return 1;
        return a.distance - b.distance;
      });

    // Only float markers for the selected destination, to avoid
    // clutter/overlap from every nearby building. If no destination is
    // set, fall back to showing just the single nearest building.
    const filtered = destination
      ? computed.filter(d => d.isDestination)
      : computed.slice(0, 1);
    setArData(filtered);

    // Update direction instruction
    if (destination) {
      const destData = computed.find(d => d.building.id === destination.id);
      if (destData) {
        if (destData.distance < 8) {
          setHasArrived(true);
          setCurrentInstruction(`You have arrived at ${destination.name}!`);
        } else {
          const rel = destData.relativeBearing;
          let inst = '';
          if (rel > -15 && rel < 15) {
            inst = `⬆️ Go straight — ${destData.distanceText}`;
          } else if (rel >= 15 && rel < 45) {
            inst = `↗️ Bear right — ${destData.distanceText}`;
          } else if (rel >= 45) {
            inst = `➡️ Turn right — ${destData.distanceText}`;
          } else if (rel <= -15 && rel > -45) {
            inst = `↖️ Bear left — ${destData.distanceText}`;
          } else {
            inst = `⬅️ Turn left — ${destData.distanceText}`;
          }
          setCurrentInstruction(inst);
        }
      }
    } else if (computed.length > 0) {
      const nearest = computed[0];
      setCurrentInstruction(
        `📍 ${nearest.building.shortName || nearest.building.name} is ${nearest.distanceText} away`
      );
    }
  }, [effLat, effLng, heading, buildings, destination?.id]);

  const destinationData = arData.find(d => d.isDestination);

  function handleBuildingPress(building: Building) {
    navigation.navigate('Navigation', { destination: building });
  }

  // No permission
  if (!permission?.granted) {
    return (
      <View style={styles.permScreen}>
        <Text style={{ fontSize: 56, marginBottom: 16 }}>📷</Text>
        <Text style={styles.permTitle}>Camera Required</Text>
        <Text style={styles.permText}>
          AR Navigation needs camera access to overlay directions.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Allow Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginTop: 12 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: COLORS.primary, fontSize: 14 }}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* CAMERA FEED */}
      <CameraView style={StyleSheet.absoluteFill} facing="back" />

      {/* Dark gradient overlay at top and bottom */}
      <View style={styles.topGradient} pointerEvents="none" />
      <View style={styles.bottomGradient} pointerEvents="none" />

      {/* AR MARKERS — floating over camera */}
      <AROverlay
        locations={arData}
        onPress={handleBuildingPress}
      />

      {/* ── TOP UI ─────────────────────────────────── */}
      <SafeAreaView style={styles.topUI} edges={['top']}>
        <View style={styles.topBar}>
          {/* Back */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {/* AR Badge */}
          <View style={styles.arBadge}>
            <View style={styles.arDot} />
            <Text style={styles.arBadgeText}>AR NAVIGATION</Text>
          </View>

          {/* Compass */}
          <ARCompass heading={heading} isAvailable={compassAvailable} />
        </View>

        {/* Direction banner */}
        <View style={styles.bannerContainer}>
          <ARDirectionBanner
            instruction={currentInstruction}
            distance={destinationData?.distanceText || null}
            destinationName={destination?.name || null}
            hasArrived={hasArrived}
          />
        </View>
      </SafeAreaView>

      {/* ── CENTRE CROSSHAIR ───────────────────────── */}
      <View style={styles.crosshair} pointerEvents="none">
        <View style={styles.crosshairOuter} />
        <View style={styles.crosshairH} />
        <View style={styles.crosshairV} />
        <View style={styles.crosshairDot} />
      </View>

      {/* ── RADAR DOTS (horizon line) ──────────────── */}
      <View style={styles.horizonLine} pointerEvents="none">
        {arData.slice(0, 6).map((d, i) => {
          const FOV = 80;
          const x = W / 2 + (d.relativeBearing / FOV) * W;
          const inView = Math.abs(d.relativeBearing) < 70;
          if (!inView) return null;
          return (
            <View
              key={d.building.id}
              style={[
                styles.horizonDot,
                {
                  left: x - 4,
                  backgroundColor: d.isDestination
                    ? COLORS.primary
                    : 'rgba(255,255,255,0.6)',
                  width: d.isDestination ? 10 : 6,
                  height: d.isDestination ? 10 : 6,
                  borderRadius: d.isDestination ? 5 : 3,
                },
              ]}
            />
          );
        })}
      </View>

      {/* ── BOTTOM UI ──────────────────────────────── */}
      <View style={styles.bottomUI}>
        {/* Location list toggle */}
        <TouchableOpacity
          style={styles.listToggleBtn}
          onPress={() => setShowList(!showList)}
        >
          <Text style={styles.listToggleText}>
            {showList ? '▼ Hide locations' : '▲ All locations nearby'}
          </Text>
        </TouchableOpacity>

        {/* Horizontal scroll list */}
        {showList && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.locationScroll}
            contentContainerStyle={styles.locationScrollContent}
          >
            {arData.slice(0, 8).map(d => (
              <TouchableOpacity
                key={d.building.id}
                style={[
                  styles.locationChip,
                  d.isDestination && styles.locationChipDest,
                ]}
                onPress={() => handleBuildingPress(d.building)}
              >
                <Text style={styles.chipEmoji}>
                  {BUILDING_EMOJIS[d.building.type] || '📍'}
                </Text>
                <View>
                  <Text style={styles.chipName} numberOfLines={1}>
                    {d.building.shortName || d.building.name}
                  </Text>
                  <Text style={[
                    styles.chipDist,
                    d.isDestination && { color: COLORS.primary },
                  ]}>
                    {d.distanceText}
                    {d.building.floor && d.building.floor > 1 ? ' · ⬆️' : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Bottom action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.mapBtnText}>🗺️ Map View</Text>
          </TouchableOpacity>

          {destination && (
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => navigation.navigate('Navigation', { destination })}
            >
              <Text style={styles.navBtnText}>🧭 Navigate</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* GPS status */}
        {!userLocation && (
          <View style={styles.gpsBanner}>
            <Text style={styles.gpsBannerText}>
              📍 Getting GPS — using demo location
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  // Gradients
  topGradient: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: H * 0.35,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
    pointerEvents: 'none',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: H * 0.35,
    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
    pointerEvents: 'none',
  },

  // Top UI
  topUI: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.md,
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.sm,
  },
  closeBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: 'white', fontSize: 17, fontWeight: '700' },
  arBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,229,192,0.18)',
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,229,192,0.5)',
  },
  arDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  arBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    fontFamily: 'monospace',
  },
  bannerContainer: {
    marginHorizontal: SIZES.md,
    marginTop: SIZES.sm,
  },

  // Crosshair
  crosshair: {
    position: 'absolute',
    top: H / 2 - 24,
    left: W / 2 - 24,
    width: 48, height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairOuter: {
    position: 'absolute',
    width: 48, height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,229,192,0.3)',
  },
  crosshairH: {
    position: 'absolute',
    width: 40, height: 1.5,
    backgroundColor: 'rgba(0,229,192,0.6)',
  },
  crosshairV: {
    position: 'absolute',
    width: 1.5, height: 40,
    backgroundColor: 'rgba(0,229,192,0.6)',
  },
  crosshairDot: {
    width: 7, height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.primary,
  },

  // Horizon line
  horizonLine: {
    position: 'absolute',
    top: H * 0.52,
    left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(0,229,192,0.12)',
  },
  horizonDot: {
    position: 'absolute',
    top: -3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },

  // Bottom UI
  bottomUI: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: SIZES.md,
    paddingBottom: 32,
    gap: SIZES.sm,
  },
  listToggleBtn: {
    alignSelf: 'center',
    backgroundColor: 'rgba(5,14,31,0.75)',
    borderRadius: 100,
    paddingHorizontal: SIZES.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  listToggleText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  locationScroll: { maxHeight: 80 },
  locationScrollContent: {
    gap: SIZES.sm,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
    backgroundColor: 'rgba(5,14,31,0.85)',
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    minWidth: 110,
  },
  locationChipDest: {
    backgroundColor: 'rgba(0,229,192,0.15)',
    borderColor: COLORS.primary,
  },
  chipEmoji: { fontSize: 18 },
  chipName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    maxWidth: 90,
  },
  chipDist: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  mapBtn: {
    flex: 1,
    backgroundColor: 'rgba(5,14,31,0.85)',
    borderRadius: SIZES.radiusSm,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  mapBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  navBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusSm,
    paddingVertical: SIZES.md,
    alignItems: 'center',
  },
  navBtnText: { color: COLORS.background, fontSize: 14, fontWeight: '800' },
  gpsBanner: {
    alignSelf: 'center',
    backgroundColor: 'rgba(5,14,31,0.8)',
    borderRadius: 100,
    paddingHorizontal: SIZES.md,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gpsBannerText: { color: COLORS.textDim, fontSize: 11 },

  // Permission screen
  permScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.xl,
  },
  permTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: SIZES.sm,
  },
  permText: {
    color: COLORS.textDim,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SIZES.xl,
  },
  permBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: SIZES.xxl,
    paddingVertical: SIZES.md,
  },
  permBtnText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: '700',
  },
});
