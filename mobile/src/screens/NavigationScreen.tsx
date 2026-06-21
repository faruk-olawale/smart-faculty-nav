import React, { useRef, useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { TravelModeSelector } from '../components/navigation/TravelModeSelector';
import { TurnByTurnPanel } from '../components/navigation/TurnByTurnPanel';
import { COLORS, SIZES } from '../constants/theme';
import { FACULTY_ICT } from '../constants';
import {
  calculateRoute,
  formatDistance,
  formatDuration,
} from '../services/routeService';
import { useLocation } from '../hooks/useLocation';
import { useAppStore } from '../store/useAppStore';
import type { Building, TravelMode, RouteResult } from '../types';

export default function NavigationScreen({ route: navRoute, navigation }: any) {
  const destination: Building = navRoute.params?.destination;
  const webViewRef = useRef<WebView>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [travelMode, setTravelMode] = useState<TravelMode>('foot');
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [startCoords, setStartCoords] = useState<{ lat: number; lng: number } | null>(null);

  const { getCurrentLocation, startTracking, userLocation } = useLocation();
  const { setRoute: setGlobalRoute } = useAppStore();

  useEffect(() => {
    if (mapReady) initNavigation('foot');
  }, [mapReady]);

  useEffect(() => {
    if (route && mapReady) {
      sendToMap('SET_ROUTE', {
        coordinates: route.geometry.coordinates,
        mode: route.mode,
      });
      setGlobalRoute(route);
    }
  }, [route, mapReady]);

  useEffect(() => {
    if (userLocation && mapReady) {
      sendToMap('SET_USER_LOCATION', userLocation);
    }
  }, [userLocation, mapReady]);

  async function initNavigation(mode: TravelMode) {
    setIsCalculating(true);
    try {
      let lat = startCoords?.lat;
      let lng = startCoords?.lng;
      if (!lat || !lng) {
        const loc = await getCurrentLocation();
        await startTracking();
        lat = loc?.lat ?? FACULTY_ICT.latitude;
        lng = loc?.lng ?? FACULTY_ICT.longitude;
        setStartCoords({ lat, lng });
      }
      const result = await calculateRoute(
        lat, lng,
        destination.latitude, destination.longitude,
        mode
      );
      setRoute(result);
      sendToMap('FIT_ROUTE', {
        start: { lat, lng },
        end: { lat: destination.latitude, lng: destination.longitude },
      });
    } catch (e) {
      console.error('Nav error:', e);
    } finally {
      setIsCalculating(false);
    }
  }

  async function handleModeChange(mode: TravelMode) {
    setTravelMode(mode);
    setIsCalculating(true);
    try {
      const lat = startCoords?.lat ?? FACULTY_ICT.latitude;
      const lng = startCoords?.lng ?? FACULTY_ICT.longitude;
      const result = await calculateRoute(
        lat, lng,
        destination.latitude, destination.longitude,
        mode
      );
      setRoute(result);
    } finally {
      setIsCalculating(false);
    }
  }

  function sendToMap(type: string, payload: any) {
    webViewRef.current?.injectJavaScript(`
      window.dispatchEvent(new CustomEvent('nav_message', {
        detail: { type: '${type}', payload: ${JSON.stringify(payload)} }
      }));
      true;
    `);
  }

  function handleStop() {
    setGlobalRoute(null);
    navigation.goBack();
  }

  function handleOpenAR() {
    navigation.navigate('AR', { destination });
  }

  const modeColors: Record<TravelMode, string> = {
    foot: '#00E5C0',
    bike: '#F59E0B',
    car: '#7C3AED',
  };

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
    .leaflet-tile-pane{filter:brightness(0.85) saturate(0.85);}
    .leaflet-control-attribution{display:none;}
    @keyframes pulse{
      0%{box-shadow:0 0 0 0 rgba(0,229,192,0.6);}
      70%{box-shadow:0 0 0 14px rgba(0,229,192,0);}
      100%{box-shadow:0 0 0 0 rgba(0,229,192,0);}
    }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  const map = L.map('map',{
    center:[${FACULTY_ICT.latitude},${FACULTY_ICT.longitude}],
    zoom:19, zoomControl:false,
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:22}).addTo(map);

  let userMarker=null, routeLayer=null;

  L.marker(
    [${destination?.latitude||FACULTY_ICT.latitude},
     ${destination?.longitude||FACULTY_ICT.longitude}],
    { icon: L.divIcon({
        className:'',
        html:\`<div style="width:48px;height:48px;background:#FF6B35;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 4px 16px rgba(255,107,53,0.5);">📍</div>\`,
        iconSize:[48,48],iconAnchor:[24,24],
    })}
  ).addTo(map)
  .bindTooltip('${destination?.name||'Destination'}',{permanent:true,direction:'top',offset:[0,-28]});

  map.flyTo([${destination?.latitude||FACULTY_ICT.latitude},${destination?.longitude||FACULTY_ICT.longitude}],19,{duration:0.8});

  function setUserLocation(loc){
    if(userMarker) map.removeLayer(userMarker);
    userMarker=L.marker([loc.lat,loc.lng],{
      icon:L.divIcon({
        className:'',
        html:\`<div style="width:20px;height:20px;background:#00E5C0;border-radius:50%;border:3px solid white;animation:pulse 2s infinite;"></div>\`,
        iconSize:[20,20],iconAnchor:[10,10],
      }),zIndexOffset:1000,
    }).addTo(map);
  }

  function setRoute(data){
    if(routeLayer) map.removeLayer(routeLayer);
    const coords=data.coordinates.map(c=>[c[1],c[0]]);
    const colors={foot:'#00E5C0',bike:'#F59E0B',car:'#7C3AED'};
    const color=colors[data.mode]||'#00E5C0';
    routeLayer=L.layerGroup([
      L.polyline(coords,{color:color+'44',weight:14,lineCap:'round'}),
      L.polyline(coords,{color,weight:5,lineCap:'round',dashArray:data.mode==='foot'?'10 6':null}),
      L.circleMarker(coords[0],{radius:8,fillColor:'#00E5C0',color:'white',weight:2.5,fillOpacity:1}),
      L.circleMarker(coords[coords.length-1],{radius:8,fillColor:'#FF6B35',color:'white',weight:2.5,fillOpacity:1}),
    ]).addTo(map);
  }

  function fitRoute(data){
    map.fitBounds(L.latLngBounds([data.start.lat,data.start.lng],[data.end.lat,data.end.lng]).pad(0.25),{animate:true,duration:0.8});
  }

  window.addEventListener('nav_message',(e)=>{
    const{type,payload}=e.detail;
    if(type==='SET_USER_LOCATION') setUserLocation(payload);
    if(type==='SET_ROUTE') setRoute(payload);
    if(type==='FIT_ROUTE') fitRoute(payload);
  });

  window.ReactNativeWebView.postMessage(JSON.stringify({type:'MAP_READY'}));
</script>
</body>
</html>`;

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <TouchableOpacity onPress={handleStop} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {destination?.name || 'Navigation'}
          </Text>
          <Text style={styles.headerSub}>
            {destination?.type?.replace(/_/g, ' ')}
          </Text>
        </View>
        {/* AR BUTTON — top right */}
        <TouchableOpacity style={styles.arBtn} onPress={handleOpenAR}>
          <Text style={styles.arBtnText}>📷 AR</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Turn by turn */}
      {route?.steps && (
        <TurnByTurnPanel
          steps={route.steps}
          currentIndex={0}
          isExpanded={showSteps}
          onToggle={() => setShowSteps(!showSteps)}
        />
      )}

      {/* Map */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHTML }}
          style={styles.map}
          onMessage={(e) => {
            try {
              const msg = JSON.parse(e.nativeEvent.data);
              if (msg.type === 'MAP_READY') setMapReady(true);
            } catch {}
          }}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
          mixedContentMode="always"
        />
        {isCalculating && (
          <View style={styles.calculatingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.calculatingText}>
              Calculating {travelMode} route...
            </Text>
          </View>
        )}
      </View>

      {/* Travel mode */}
      <View style={styles.modeSection}>
        <TravelModeSelector
          selected={travelMode}
          onSelect={handleModeChange}
        />
      </View>

      {/* Stats row */}
      {route && (
        <View style={styles.statsRow}>
          {/* Distance */}
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{route.distanceText}</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>

          <View style={styles.statDivider} />

          {/* ETA */}
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>
              {route.durationText}
            </Text>
            <Text style={styles.statLabel}>ETA</Text>
          </View>

          <View style={styles.statDivider} />

          {/* Speed */}
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: modeColors[travelMode], fontSize: 14 }]}>
              {travelMode === 'foot' ? '5' : travelMode === 'bike' ? '15' : '40'} km/h
            </Text>
            <Text style={styles.statLabel}>Speed</Text>
          </View>

          {/* AR Button — large and visible */}
          <TouchableOpacity
            style={styles.arLargeBtn}
            onPress={handleOpenAR}
          >
            <Text style={styles.arLargeBtnIcon}>📷</Text>
            <Text style={styles.arLargeBtnText}>AR View</Text>
          </TouchableOpacity>

          {/* Stop */}
          <TouchableOpacity style={styles.stopBtn} onPress={handleStop}>
            <Text style={styles.stopBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    backgroundColor: COLORS.panel,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 60 },
  backBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  headerSub: {
    color: COLORS.textDim, fontSize: 11, marginTop: 1,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  arBtn: {
    backgroundColor: COLORS.primaryDim,
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs + 2,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  arBtnText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  calculatingOverlay: {
    position: 'absolute', inset: 0,
    backgroundColor: 'rgba(5,14,31,0.85)',
    alignItems: 'center', justifyContent: 'center',
    gap: SIZES.md,
  },
  calculatingText: { color: COLORS.textDim, fontSize: 14 },
  modeSection: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    backgroundColor: COLORS.panel,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.panel,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    gap: SIZES.sm,
  },
  statCard: { alignItems: 'center', flex: 1 },
  statValue: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  statLabel: {
    color: COLORS.textDim,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statDivider: {
    width: 1, height: 28,
    backgroundColor: COLORS.border,
  },
  arLargeBtn: {
    backgroundColor: COLORS.primaryDim,
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs + 2,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  arLargeBtnIcon: { fontSize: 18 },
  arLargeBtnText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  stopBtn: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  stopBtnText: { color: COLORS.danger, fontSize: 14, fontWeight: '700' },
});
