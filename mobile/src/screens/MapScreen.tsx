import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, Text, TouchableOpacity,
  ActivityIndicator, Alert, Modal, Pressable,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  LocateFixed, Layers, Home, AlertTriangle, X, Check,
} from 'lucide-react-native';
import { useAppStore } from '../store/useAppStore';
import { useGPSTracking } from '../hooks/useGPSTracking';
import { BuildingBottomSheet } from '../components/buildings/BuildingBottomSheet';
import { LocationStatusBar } from '../components/tracking/LocationStatusBar';
import { FollowModeButton } from '../components/tracking/FollowModeButton';
import { COLORS, SIZES, BUILDING_COLORS, BUILDING_EMOJIS } from '../constants/theme';
import { FACULTY_ICT } from '../constants';
import { buildingApi } from '../services/api';
import { MOCK_BUILDINGS } from '../utils/mockBuildings';
import type { Building } from '../types';

type MapType = 'default' | 'satellite';

export default function MapScreen({ navigation }: any) {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [followMode, setFollowMode] = useState(false);
  const [mapType, setMapType] = useState<MapType>('default');
  const [showMapTypeSheet, setShowMapTypeSheet] = useState(false);

  const {
    buildings, setBuildings,
    selectedBuilding, setSelectedBuilding,
    userLocation, route,
  } = useAppStore();

  const {
    isTracking, accuracyLabel, speed,
    remainingDistance, hasArrived,
    startTracking, stopTracking,
    getOnce, heading,
  } = useGPSTracking();

  useEffect(() => {
    async function load() {
      try {
        const res = await buildingApi.getAll();
        if (res.data && res.data.length > 0) {
          setBuildings(res.data);
        } else throw new Error('empty');
      } catch {
        setBuildings(MOCK_BUILDINGS);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (buildings.length > 0 && !isLoading) {
      setTimeout(() => sendToMap('SET_BUILDINGS', buildings), 300);
    }
  }, [buildings, isLoading]);

  useEffect(() => {
    if (route && !isLoading) {
      sendToMap('SET_ROUTE', {
        coordinates: route.geometry.coordinates,
        mode: route.mode,
      });
    }
  }, [route, isLoading]);

  useEffect(() => {
    if (userLocation && !isLoading) {
      sendToMap('SET_USER_LOCATION', {
        ...userLocation,
        heading: heading ?? undefined,
      });
      if (followMode) {
        sendToMap('FLY_TO', {
          lat: userLocation.lat,
          lng: userLocation.lng,
          zoom: 19,
        });
      }
    }
  }, [userLocation, isLoading, followMode]);

  function sendToMap(type: string, payload: any) {
    webViewRef.current?.injectJavaScript(`
      window.dispatchEvent(new CustomEvent('app_message', {
        detail: { type: '${type}', payload: ${JSON.stringify(payload)} }
      }));
      true;
    `);
  }

  async function handleLocateMe() {
    const loc = await getOnce();
    if (loc) {
      sendToMap('FLY_TO', { lat: loc.lat, lng: loc.lng, zoom: 19 });
      if (!isTracking) await startTracking();
    } else {
      Alert.alert(
        'Location Error',
        'Could not get your location. Make sure GPS is enabled.'
      );
    }
  }

  function handleToggleFollow() {
    const newMode = !followMode;
    setFollowMode(newMode);
    if (newMode && userLocation) {
      sendToMap('FLY_TO', {
        lat: userLocation.lat,
        lng: userLocation.lng,
        zoom: 19,
      });
    }
  }

  function handleEmergency() {
    const emergency = buildings.find(b => b.isEmergency);
    if (emergency) {
      setSelectedBuilding(emergency);
      sendToMap('FLY_TO', {
        lat: emergency.latitude,
        lng: emergency.longitude,
        zoom: 19,
      });
    } else {
      Alert.alert('Emergency', 'Call 112 immediately');
    }
  }

  function handleSelectMapType(type: MapType) {
    setMapType(type);
    sendToMap('SET_MAP_TYPE', { type });
    setShowMapTypeSheet(false);
  }

  function handleMessage(event: any) {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'BUILDING_TAPPED') {
        const building = buildings.find(b => b.id === msg.payload.id);
        if (building) setSelectedBuilding(building);
      } else if (msg.type === 'MAP_TAPPED') {
        setSelectedBuilding(null);
        setFollowMode(false);
      } else if (msg.type === 'MAP_READY') {
        setIsLoading(false);
        if (buildings.length > 0) {
          setTimeout(() => sendToMap('SET_BUILDINGS', buildings), 400);
        }
      }
    } catch {}
  }

  function handleNavigate(building: Building) {
    setSelectedBuilding(null);
    navigation.navigate('Navigation', { destination: building });
  }

  const mapHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    html,body{height:100%;background:#050E1F;}
    #map{height:100%;width:100%;}
    #map.dimmed .leaflet-tile-pane{filter:brightness(0.85) saturate(0.85);}
    .leaflet-control-attribution{display:none;}

    @keyframes userPulse {
      0% { box-shadow: 0 0 0 0 rgba(0,229,192,0.7); }
      70% { box-shadow: 0 0 0 16px rgba(0,229,192,0); }
      100% { box-shadow: 0 0 0 0 rgba(0,229,192,0); }
    }
    @keyframes emergencyPulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.7); }
      50% { box-shadow: 0 0 0 12px rgba(239,68,68,0); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
<div id="map" class="dimmed"></div>
<script>
  const BUILDING_COLORS = ${JSON.stringify(BUILDING_COLORS)};
  const BUILDING_EMOJIS = ${JSON.stringify(BUILDING_EMOJIS)};

  const map = L.map('map', {
    center: [${FACULTY_ICT.latitude}, ${FACULTY_ICT.longitude}],
    zoom: 19,
    zoomControl: false,
  });

  const DEFAULT_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const SATELLITE_TILES = 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';

  let currentTileLayer = L.tileLayer(DEFAULT_TILES, { maxZoom: 22 }).addTo(map);

  function setMapType(type) {
    map.removeLayer(currentTileLayer);
    const mapEl = document.getElementById('map');
    if (type === 'satellite') {
      currentTileLayer = L.tileLayer(SATELLITE_TILES, { maxZoom: 21 }).addTo(map);
      mapEl.classList.remove('dimmed');
      map.setMaxZoom(19);
      if (map.getZoom() > 19) map.setZoom(19);
    } else {
      currentTileLayer = L.tileLayer(DEFAULT_TILES, { maxZoom: 22 }).addTo(map);
      mapEl.classList.add('dimmed');
      map.setMaxZoom(22);
    }
  }

  let markers = {}, userMarker = null, routeLayer = null;
  let allBuildings = [], accuracyCircle = null;

  function createIcon(building, isSelected) {
    const color = building.isEmergency
      ? '#EF4444'
      : (BUILDING_COLORS[building.type] || '#00E5C0');
    const emoji = BUILDING_EMOJIS[building.type] || '📍';
    const size = isSelected ? 56 : 44;
    const isUpstairs = building.floor && building.floor > 1;
    return L.divIcon({
      className: '',
      html: \`<div style="
        width:\${size}px; height:\${size}px;
        background:\${color}; border-radius: 50%;
        border:\${isSelected ? 4 : 2.5}px solid rgba(255,255,255,0.95);
        display:flex; align-items:center; justify-content:center;
        box-shadow: 0 4px 16px rgba(0,0,0,0.5)\${isSelected ? ',0 0 0 5px '+color+'55' : ''};
        font-size:\${isSelected ? 24 : 20}px;
        position: relative;
        \${building.isEmergency ? 'animation: emergencyPulse 2s infinite;' : ''}
      ">
        \${emoji}
        \${isUpstairs ? '<span style="position:absolute;top:-6px;right:-6px;background:#F59E0B;color:#000;font-size:9px;font-weight:700;padding:1px 4px;border-radius:6px;border:1px solid white;">2F</span>' : ''}
      </div>\`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
    });
  }

  function renderBuildings(buildings) {
    allBuildings = buildings;
    Object.values(markers).forEach(m => map.removeLayer(m));
    markers = {};

    buildings.forEach(b => {
      const marker = L.marker([b.latitude, b.longitude], {
        icon: createIcon(b, false),
        title: b.name,
      }).addTo(map);

      L.marker([b.latitude, b.longitude], {
        icon: L.divIcon({
          className: '',
          html: \`<div style="
            background: rgba(5,14,31,0.88);
            color: #E2EAF4; font-size: 10px; font-weight: 600;
            padding: 2px 7px; border-radius: 5px;
            border: 1px solid rgba(0,229,192,0.25);
            white-space: nowrap; margin-top: 26px;
            pointer-events: none;
          ">\${b.shortName || b.name}</div>\`,
          iconSize: [120, 20],
          iconAnchor: [60, -18],
        }),
        interactive: false,
        zIndexOffset: -100,
      }).addTo(map);

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        Object.entries(markers).forEach(([id, m]) => {
          const bld = allBuildings.find(x => x.id === id);
          if (bld) m.setIcon(createIcon(bld, id === b.id));
        });
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'BUILDING_TAPPED',
          payload: { id: b.id },
        }));
      });

      markers[b.id] = marker;
    });
  }

  function setUserLocation(loc) {
    if (userMarker) map.removeLayer(userMarker);
    if (accuracyCircle) map.removeLayer(accuracyCircle);

    if (loc.accuracy && loc.accuracy < 50) {
      accuracyCircle = L.circle([loc.lat, loc.lng], {
        radius: loc.accuracy,
        color: '#00E5C0',
        fillColor: '#00E5C0',
        fillOpacity: 0.08,
        weight: 1,
      }).addTo(map);
    }

    const headingHTML = loc.heading != null
      ? \`<div style="
          position:absolute; top:-10px; left:50%;
          transform:translateX(-50%) rotate(\${loc.heading}deg);
          width:0; height:0;
          border-left:5px solid transparent;
          border-right:5px solid transparent;
          border-bottom:14px solid #00E5C0;
          filter: drop-shadow(0 0 4px #00E5C0);
        "></div>\`
      : '';

    userMarker = L.marker([loc.lat, loc.lng], {
      icon: L.divIcon({
        className: '',
        html: \`<div style="position:relative; width:24px; height:24px;">
          \${headingHTML}
          <div style="
            width:20px; height:20px; margin:2px;
            background:#00E5C0; border-radius:50%;
            border:3px solid white;
            animation:userPulse 2s infinite;
            box-shadow:0 0 0 0 rgba(0,229,192,0.7);
          "></div>
        </div>\`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
      zIndexOffset: 1000,
    }).addTo(map)
    .bindTooltip('📍 You are here', {
      permanent: false,
      direction: 'top',
      offset: [0, -14],
    });
  }

  function setRoute(data) {
    if (routeLayer) map.removeLayer(routeLayer);
    const coords = data.coordinates.map(c => [c[1], c[0]]);
    const modeColors = { foot:'#00E5C0', bike:'#F59E0B', car:'#7C3AED' };
    const color = modeColors[data.mode] || '#00E5C0';
    routeLayer = L.layerGroup([
      L.polyline(coords, {
        color: color+'44', weight: 14,
        lineCap:'round', lineJoin:'round'
      }),
      L.polyline(coords, {
        color, weight: 5,
        lineCap:'round', lineJoin:'round',
        dashArray: data.mode==='foot' ? '10 6' : null,
      }),
      L.circleMarker(coords[0], {
        radius:8, fillColor:'#00E5C0',
        color:'white', weight:2.5, fillOpacity:1
      }),
      L.circleMarker(coords[coords.length-1], {
        radius:8, fillColor:'#FF6B35',
        color:'white', weight:2.5, fillOpacity:1
      }),
    ]).addTo(map);
  }

  window.addEventListener('app_message', (e) => {
    const { type, payload } = e.detail;
    if (type === 'SET_BUILDINGS') renderBuildings(payload);
    if (type === 'SET_USER_LOCATION') setUserLocation(payload);
    if (type === 'SET_ROUTE') setRoute(payload);
    if (type === 'SET_MAP_TYPE') setMapType(payload.type);
    if (type === 'FLY_TO') {
      map.flyTo([payload.lat, payload.lng], payload.zoom || 19, {
        duration: 0.6,
        animate: true,
      });
    }
    if (type === 'CLEAR_HIGHLIGHT') {
      allBuildings.forEach(b => {
        if (markers[b.id]) markers[b.id].setIcon(createIcon(b, false));
      });
    }
  });

  map.on('click', () => {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: 'MAP_TAPPED' })
    );
  });

  window.ReactNativeWebView.postMessage(
    JSON.stringify({ type: 'MAP_READY' })
  );
</script>
</body>
</html>`;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHTML }}
        style={styles.map}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        mixedContentMode="always"
        allowsInlineMediaPlayback
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading ICT Faculty map...</Text>
        </View>
      )}

      <View style={styles.badge}>
        <View style={[
          styles.gpsIndicator,
          { backgroundColor: isTracking ? '#10B981' : COLORS.textDim }
        ]} />
        <Text style={styles.badgeText}>
          KWASU ICT · {buildings.length} locations
          {isTracking ? ' · GPS ON' : ''}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.ctrlBtn, mapType === 'satellite' && styles.ctrlActive]}
          onPress={() => setShowMapTypeSheet(true)}
        >
          <Layers size={20} color={mapType === 'satellite' ? COLORS.primary : COLORS.text} strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ctrlBtn, isTracking && styles.ctrlActive]}
          onPress={handleLocateMe}
        >
          <LocateFixed size={20} color={isTracking ? COLORS.primary : COLORS.text} strokeWidth={2} />
        </TouchableOpacity>

        <FollowModeButton
          isFollowing={followMode}
          onToggle={handleToggleFollow}
        />

        <TouchableOpacity
          style={styles.ctrlBtn}
          onPress={() => sendToMap('FLY_TO', {
            lat: FACULTY_ICT.latitude,
            lng: FACULTY_ICT.longitude,
            zoom: 19,
          })}
        >
          <Home size={20} color={COLORS.text} strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ctrlBtn, styles.emergencyCtrl]}
          onPress={handleEmergency}
        >
          <AlertTriangle size={20} color={COLORS.danger} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <LocationStatusBar
        isTracking={isTracking}
        accuracyLabel={accuracyLabel}
        speed={speed}
        remainingDistance={remainingDistance}
        hasArrived={hasArrived}
        onStart={startTracking}
        onStop={() => {
          stopTracking();
          setFollowMode(false);
        }}
      />

      <BuildingBottomSheet
        building={selectedBuilding}
        onClose={() => {
          setSelectedBuilding(null);
          sendToMap('CLEAR_HIGHLIGHT', {});
        }}
        onNavigate={handleNavigate}
      />

      <Modal
        visible={showMapTypeSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMapTypeSheet(false)}
      >
        <Pressable
          style={styles.sheetBackdrop}
          onPress={() => setShowMapTypeSheet(false)}
        >
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Map type</Text>
              <TouchableOpacity onPress={() => setShowMapTypeSheet(false)}>
                <X size={22} color={COLORS.textDim} />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetOptions}>
              <TouchableOpacity
                style={styles.sheetOption}
                onPress={() => handleSelectMapType('default')}
              >
                <View style={[
                  styles.sheetOptionPreview,
                  styles.previewDefault,
                  mapType === 'default' && styles.sheetOptionPreviewActive,
                ]} />
                <Text style={[
                  styles.sheetOptionLabel,
                  mapType === 'default' && styles.sheetOptionLabelActive,
                ]}>Default</Text>
                {mapType === 'default' && <Check size={16} color={COLORS.primary} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetOption}
                onPress={() => handleSelectMapType('satellite')}
              >
                <View style={[
                  styles.sheetOptionPreview,
                  styles.previewSatellite,
                  mapType === 'satellite' && styles.sheetOptionPreviewActive,
                ]} />
                <Text style={[
                  styles.sheetOptionLabel,
                  mapType === 'satellite' && styles.sheetOptionLabelActive,
                ]}>Satellite</Text>
                {mapType === 'satellite' && <Check size={16} color={COLORS.primary} />}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  map: { flex: 1 },
  loadingOverlay: {
    position: 'absolute', inset: 0,
    backgroundColor: COLORS.background,
    alignItems: 'center', justifyContent: 'center',
    gap: SIZES.md,
  },
  loadingText: {
    color: COLORS.textDim,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  badge: {
    position: 'absolute',
    top: 52, left: SIZES.md,
    backgroundColor: COLORS.panel,
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: SIZES.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  gpsIndicator: {
    width: 7, height: 7,
    borderRadius: 4,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  controls: {
    position: 'absolute',
    right: SIZES.md,
    top: 100,
    gap: SIZES.sm,
  },
  ctrlBtn: {
    width: 48, height: 48,
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
    elevation: 6,
  },
  ctrlActive: {
    backgroundColor: COLORS.primaryDim,
    borderColor: COLORS.primary,
  },
  emergencyCtrl: {
    marginTop: SIZES.sm,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderColor: 'rgba(239,68,68,0.3)',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.panel,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.xl,
    paddingHorizontal: SIZES.md,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  sheetHandle: {
    width: 36, height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: SIZES.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  sheetTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  sheetOptions: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  sheetOption: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  sheetOptionPreview: {
    width: '100%',
    height: 70,
    borderRadius: SIZES.radiusSm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  previewDefault: {
    backgroundColor: '#2D3B52',
  },
  previewSatellite: {
    backgroundColor: '#3A4A2E',
  },
  sheetOptionPreviewActive: {
    borderColor: COLORS.primary,
  },
  sheetOptionLabel: {
    color: COLORS.textDim,
    fontSize: 13,
    fontWeight: '600',
  },
  sheetOptionLabelActive: {
    color: COLORS.primary,
  },
});
