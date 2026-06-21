import React from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, Image,
} from 'react-native';
import { COLORS, SIZES, BUILDING_COLORS, BUILDING_EMOJIS } from '../../constants/theme';
import type { QRScanResult } from '../../hooks/useQRScanner';

interface Props {
  result: QRScanResult;
  onNavigate: () => void;
  onViewDetails: () => void;
  onScanAgain: () => void;
}

export function QRResultCard({
  result, onNavigate, onViewDetails, onScanAgain,
}: Props) {
  const { building, qrLabel } = result;
  const color = building.isEmergency
    ? COLORS.danger
    : (BUILDING_COLORS[building.type] || COLORS.primary);
  const emoji = BUILDING_EMOJIS[building.type] || '📍';
  const isUpstairs = building.floor && building.floor > 1;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: color + '22' }]}>
          <Text style={styles.iconEmoji}>{emoji}</Text>
        </View>
        <View style={styles.headerText}>
          <View style={styles.scanBadge}>
            <Text style={styles.scanBadgeText}>✅ QR Scanned</Text>
          </View>
          <Text style={styles.buildingName} numberOfLines={2}>
            {building.name}
          </Text>
          <Text style={styles.qrLabel}>📍 {qrLabel}</Text>
        </View>
      </View>

      {/* Info row */}
      <View style={styles.infoRow}>
        {building.openingHours && (
          <View style={styles.infoChip}>
            <Text style={styles.infoChipText}>
              🕐 {building.openingHours.split('|')[0].trim()}
            </Text>
          </View>
        )}
        {isUpstairs && (
          <View style={[styles.infoChip, { backgroundColor: '#F59E0B22', borderColor: '#F59E0B44' }]}>
            <Text style={[styles.infoChipText, { color: '#F59E0B' }]}>
              ⬆️ Floor {building.floor}
            </Text>
          </View>
        )}
        {building.isEmergency && (
          <View style={[styles.infoChip, { backgroundColor: COLORS.danger + '22', borderColor: COLORS.danger + '44' }]}>
            <Text style={[styles.infoChipText, { color: COLORS.danger }]}>
              🚨 Emergency
            </Text>
          </View>
        )}
      </View>

      {/* Description */}
      {building.description && (
        <Text style={styles.description} numberOfLines={2}>
          {building.description}
        </Text>
      )}

      {/* Coordinates */}
      <View style={styles.coordRow}>
        <Text style={styles.coordText}>
          📍 {result.userPosition.lat.toFixed(6)}°N,{' '}
          {result.userPosition.lng.toFixed(6)}°E
        </Text>
        <Text style={styles.coordSub}>Your detected position</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={onNavigate}
          activeOpacity={0.85}
        >
          <Text style={styles.navBtnText}>🧭 Navigate Here</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onViewDetails}
          >
            <Text style={styles.secondaryBtnText}>ℹ️ Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onScanAgain}
          >
            <Text style={styles.secondaryBtnText}>📷 Scan Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.panel,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.md,
    margin: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginBottom: SIZES.sm,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji: { fontSize: 26 },
  headerText: { flex: 1 },
  scanBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderRadius: 100,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  scanBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  buildingName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  qrLabel: {
    color: COLORS.textDim,
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.xs,
    marginBottom: SIZES.sm,
  },
  infoChip: {
    backgroundColor: COLORS.primaryDim,
    borderRadius: 100,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoChipText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    color: COLORS.textDim,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: SIZES.sm,
  },
  coordRow: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: SIZES.radiusSm,
    padding: SIZES.sm,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  coordText: {
    color: COLORS.primary,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  coordSub: {
    color: COLORS.textDim,
    fontSize: 10,
    marginTop: 2,
  },
  actions: { gap: SIZES.sm },
  navBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
    alignItems: 'center',
  },
  navBtnText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: SIZES.radiusSm,
    padding: SIZES.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryBtnText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
