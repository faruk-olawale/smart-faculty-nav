import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Image,
} from 'react-native';
import { COLORS, SIZES, BUILDING_EMOJIS } from '../../constants/theme';
import { qrApi } from '../../services/api';
import type { Building } from '../../types';

interface Props {
  buildings: Building[];
}

export function QRGenerator({ buildings }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateQR(building: Building) {
    setSelectedId(building.id);
    setIsGenerating(true);
    setError(null);
    setQrDataUrl(null);

    try {
      // Try API
      if (building.qrLocations && building.qrLocations.length > 0) {
        const res = await qrApi.generate(building.qrLocations[0].id);
        if (res.data?.qrDataUrl) {
          setQrDataUrl(res.data.qrDataUrl);
          return;
        }
      }
      // Fallback: generate QR payload string visually
      const payload = JSON.stringify({
        type: 'kwasu_nav',
        buildingId: building.id,
        qrCode: `KWASU_QR:${building.id}:entrance`,
        label: building.name,
        lat: building.latitude,
        lng: building.longitude,
      });
      // Show payload as text since we can't generate image without API
      setQrDataUrl(`text:${payload}`);
    } catch (e: any) {
      setError('Could not generate QR. Make sure backend is running.');
    } finally {
      setIsGenerating(false);
    }
  }

  const selectedBuilding = buildings.find(b => b.id === selectedId);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generate QR Codes</Text>
      <Text style={styles.subtitle}>
        Select a location to generate its QR code for printing
      </Text>

      {/* Building list */}
      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {buildings.map(b => (
          <TouchableOpacity
            key={b.id}
            style={[
              styles.buildingItem,
              selectedId === b.id && styles.buildingItemActive,
            ]}
            onPress={() => generateQR(b)}
            activeOpacity={0.7}
          >
            <Text style={styles.buildingEmoji}>
              {BUILDING_EMOJIS[b.type] || '📍'}
            </Text>
            <View style={styles.buildingInfo}>
              <Text style={styles.buildingName} numberOfLines={1}>
                {b.name}
              </Text>
              <Text style={styles.buildingType}>
                {b.type.replace(/_/g, ' ')}
                {b.floor && b.floor > 1 ? ` · Floor ${b.floor}` : ' · Ground floor'}
              </Text>
            </View>
            {selectedId === b.id && (
              <Text style={styles.selectedCheck}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* QR Result */}
      {isGenerating && (
        <View style={styles.qrContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.generatingText}>Generating QR code...</Text>
        </View>
      )}

      {qrDataUrl && !isGenerating && selectedBuilding && (
        <View style={styles.qrContainer}>
          {qrDataUrl.startsWith('data:image') ? (
            <>
              <Image
                source={{ uri: qrDataUrl }}
                style={styles.qrImage}
                resizeMode="contain"
              />
              <Text style={styles.qrLabel}>{selectedBuilding.name}</Text>
              <Text style={styles.qrSub}>
                Print and place at the entrance
              </Text>
            </>
          ) : (
            <View style={styles.qrFallback}>
              <Text style={styles.qrFallbackTitle}>
                QR Payload for {selectedBuilding.name}
              </Text>
              <Text style={styles.qrFallbackText}>
                {qrDataUrl.replace('text:', '')}
              </Text>
              <Text style={styles.qrSub}>
                Start backend to generate printable QR image
              </Text>
            </View>
          )}
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.textDim,
    fontSize: 13,
    marginBottom: SIZES.md,
    lineHeight: 18,
  },
  list: { maxHeight: 280 },
  buildingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    padding: SIZES.sm,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SIZES.xs,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  buildingItemActive: {
    backgroundColor: COLORS.primaryDim,
    borderColor: COLORS.primary,
  },
  buildingEmoji: { fontSize: 20, width: 28, textAlign: 'center' },
  buildingInfo: { flex: 1 },
  buildingName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  buildingType: {
    color: COLORS.textDim,
    fontSize: 11,
    marginTop: 1,
  },
  selectedCheck: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  qrContainer: {
    alignItems: 'center',
    paddingTop: SIZES.lg,
    gap: SIZES.sm,
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: SIZES.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  qrLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  qrSub: {
    color: COLORS.textDim,
    fontSize: 11,
    textAlign: 'center',
  },
  qrFallback: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
  },
  qrFallbackTitle: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: SIZES.sm,
  },
  qrFallbackText: {
    color: COLORS.textDim,
    fontSize: 10,
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  generatingText: {
    color: COLORS.textDim,
    fontSize: 13,
    marginTop: SIZES.sm,
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
    marginTop: SIZES.md,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  errorText: { color: COLORS.danger, fontSize: 13 },
});
