import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useQRScanner } from '../hooks/useQRScanner';
import { QRResultCard } from '../components/qr/QRResultCard';
import { QRGenerator } from '../components/qr/QRGenerator';
import { COLORS, SIZES } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCANNER_SIZE = SCREEN_WIDTH * 0.72;

type Tab = 'scan' | 'generate';

export default function QRScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<Tab>('scan');
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const scannedRef = useRef(false);

  const {
    isProcessing, error,
    lastResult, hasScanned,
    processQRCode, resetScanner,
  } = useQRScanner();

  const {
    buildings,
    setSelectedBuilding,
    setRouteEnd,
  } = useAppStore();

  async function startCamera() {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Camera Permission Needed',
          'Please allow camera access to scan QR codes.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    scannedRef.current = false;
    resetScanner();
    setIsCameraActive(true);
  }

  function stopCamera() {
    setIsCameraActive(false);
    scannedRef.current = false;
  }

  const handleScan = useCallback(async ({ data }: { data: string }) => {
    if (scannedRef.current || isProcessing) return;
    scannedRef.current = true;
    setIsCameraActive(false);

    const result = await processQRCode(data);
    if (!result) {
      Alert.alert(
        'Not Recognised',
        'This QR code is not a KWASU ICT navigation code.',
        [
          { text: 'Try Again', onPress: () => { scannedRef.current = false; startCamera(); } },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      scannedRef.current = false;
    }
  }, [isProcessing]);

  async function simulateScan() {
    if (!buildings.length) {
      Alert.alert('Loading', 'Buildings still loading, please wait.');
      return;
    }
    const demo = buildings[Math.floor(Math.random() * buildings.length)];
    const payload = JSON.stringify({
      type: 'kwasu_nav',
      buildingId: demo.id,
      qrCode: `KWASU_QR:${demo.id}:entrance`,
      label: demo.name,
      lat: demo.latitude,
      lng: demo.longitude,
    });
    const result = await processQRCode(payload);
    if (result) setIsCameraActive(false);
  }

  function handleNavigate() {
    if (!lastResult) return;
    setRouteEnd({
      lat: lastResult.building.latitude,
      lng: lastResult.building.longitude,
      name: lastResult.building.name,
    });
    navigation.navigate('Navigation', { destination: lastResult.building });
  }

  function handleViewDetails() {
    if (!lastResult) return;
    setSelectedBuilding(lastResult.building);
    navigation.navigate('Map');
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📱 QR Navigation</Text>
        <Text style={styles.subtitle}>
          Scan codes posted around ICT Faculty
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['scan', 'generate'] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => {
              setActiveTab(tab);
              stopCamera();
              resetScanner();
            }}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.tabTextActive,
            ]}>
              {tab === 'scan' ? '📷 Scan QR' : '🔲 Generate QR'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SCAN TAB */}
      {activeTab === 'scan' && (
        <View style={styles.scanArea}>
          {hasScanned && lastResult ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <QRResultCard
                result={lastResult}
                onNavigate={handleNavigate}
                onViewDetails={handleViewDetails}
                onScanAgain={() => {
                  resetScanner();
                  startCamera();
                }}
              />
            </ScrollView>
          ) : isCameraActive ? (
            /* Camera view */
            <View style={styles.cameraContainer}>
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                onBarcodeScanned={handleScan}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              />

              {/* Dark overlay with hole */}
              <View style={styles.overlay}>
                <View style={styles.overlayTop} />
                <View style={styles.overlayMiddle}>
                  <View style={styles.overlaySide} />
                  {/* Viewfinder */}
                  <View style={styles.viewfinder}>
                    <View style={[styles.corner, styles.cTL]} />
                    <View style={[styles.corner, styles.cTR]} />
                    <View style={[styles.corner, styles.cBL]} />
                    <View style={[styles.corner, styles.cBR]} />
                    <View style={styles.scanLineAnim} />
                  </View>
                  <View style={styles.overlaySide} />
                </View>
                <View style={styles.overlayBottom}>
                  <Text style={styles.scanHint}>
                    Align QR code within the frame
                  </Text>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={stopCamera}
                  >
                    <Text style={styles.cancelBtnText}>✕ Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {isProcessing && (
                <View style={styles.processingOverlay}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.processingText}>Reading QR code...</Text>
                </View>
              )}
            </View>
          ) : (
            /* Start screen */
            <ScrollView
              style={styles.startScroll}
              contentContainerStyle={styles.startContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Illustration */}
              <View style={styles.illustration}>
                <Text style={styles.illustrationIcon}>📱</Text>
                <View style={styles.qrGrid}>
                  {[...Array(9)].map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.qrCell,
                        [0, 2, 4, 6, 8].includes(i) && styles.qrCellFilled,
                      ]}
                    />
                  ))}
                </View>
              </View>

              <Text style={styles.startTitle}>Scan Campus QR Codes</Text>
              <Text style={styles.startSub}>
                Point your camera at QR codes posted at{'\n'}
                ICT Faculty rooms and entrances
              </Text>

              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              )}

              <TouchableOpacity style={styles.openCamBtn} onPress={startCamera}>
                <Text style={styles.openCamText}>📷 Open Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.demoBtn} onPress={simulateScan}>
                <Text style={styles.demoBtnText}>🧪 Simulate Scan (Demo)</Text>
              </TouchableOpacity>

              {/* How it works */}
              <View style={styles.howBox}>
                <Text style={styles.howTitle}>How QR Navigation Works</Text>
                {[
                  { icon: '1️⃣', text: 'Find a QR code at any ICT room entrance' },
                  { icon: '2️⃣', text: 'Tap "Open Camera" and scan the code' },
                  { icon: '3️⃣', text: 'App detects your exact location' },
                  { icon: '4️⃣', text: 'Get directions to any department' },
                ].map((s, i) => (
                  <View key={i} style={styles.howStep}>
                    <Text style={styles.howStepIcon}>{s.icon}</Text>
                    <Text style={styles.howStepText}>{s.text}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      )}

      {/* GENERATE TAB */}
      {activeTab === 'generate' && (
        <View style={styles.generateArea}>
          <QRGenerator buildings={buildings} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SIZES.md,
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 3,
  },
  subtitle: { color: COLORS.textDim, fontSize: 13 },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: SIZES.md,
    marginBottom: SIZES.md,
    backgroundColor: COLORS.panel,
    borderRadius: SIZES.radius,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.sm,
    alignItems: 'center',
    borderRadius: SIZES.radiusSm,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textDim, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: COLORS.background },

  scanArea: { flex: 1 },
  cameraContainer: { flex: 1, position: 'relative' },

  overlay: {
    position: 'absolute',
    inset: 0,
    flexDirection: 'column',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: SCANNER_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  viewfinder: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: COLORS.primary,
  },
  cTL: {
    top: 0, left: 0,
    borderTopWidth: 3, borderLeftWidth: 3,
    borderTopLeftRadius: 4,
  },
  cTR: {
    top: 0, right: 0,
    borderTopWidth: 3, borderRightWidth: 3,
    borderTopRightRadius: 4,
  },
  cBL: {
    bottom: 0, left: 0,
    borderBottomWidth: 3, borderLeftWidth: 3,
    borderBottomLeftRadius: 4,
  },
  cBR: {
    bottom: 0, right: 0,
    borderBottomWidth: 3, borderRightWidth: 3,
    borderBottomRightRadius: 4,
  },
  scanLineAnim: {
    position: 'absolute',
    left: 0, right: 0,
    top: '50%',
    height: 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.md,
    paddingTop: SIZES.md,
  },
  scanHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
  cancelBtn: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.sm,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
  },
  cancelBtnText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  processingOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(5,14,31,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.md,
  },
  processingText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },

  startScroll: { flex: 1 },
  startContent: {
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.xl,
  },
  illustration: {
    alignItems: 'center',
    marginVertical: SIZES.lg,
  },
  illustrationIcon: { fontSize: 52, marginBottom: SIZES.sm },
  qrGrid: {
    width: 66,
    height: 66,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  qrCell: {
    width: 18, height: 18,
    backgroundColor: COLORS.panel,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qrCellFilled: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  startTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  startSub: {
    color: COLORS.textDim,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SIZES.lg,
  },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  errorText: { color: COLORS.danger, fontSize: 13, textAlign: 'center' },
  openCamBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusSm,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  openCamText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
  },
  demoBtn: {
    width: '100%',
    backgroundColor: COLORS.primaryDim,
    borderRadius: SIZES.radiusSm,
    paddingVertical: SIZES.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SIZES.lg,
  },
  demoBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  howBox: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SIZES.sm,
  },
  howTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: SIZES.xs,
  },
  howStep: {
    flexDirection: 'row',
    gap: SIZES.sm,
    alignItems: 'flex-start',
  },
  howStepIcon: { fontSize: 16 },
  howStepText: {
    color: COLORS.textDim,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },

  generateArea: {
    flex: 1,
    paddingHorizontal: SIZES.md,
  },
});
