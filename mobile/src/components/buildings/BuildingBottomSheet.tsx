import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, Dimensions, Image,
} from 'react-native';
import { Building } from '../../types';
import { COLORS, SIZES, BUILDING_COLORS, BUILDING_EMOJIS } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.65;

interface Props {
  building: Building | null;
  onClose: () => void;
  onNavigate: (building: Building) => void;
}

export function BuildingBottomSheet({ building, onClose, onNavigate }: Props) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (building) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [building]);

  if (!building) return null;

  const color = building.isEmergency
    ? COLORS.danger
    : (BUILDING_COLORS[building.type] || COLORS.primary);
  const emoji = BUILDING_EMOJIS[building.type] || '🏛️';

  return (
    <>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[
        styles.sheet,
        { transform: [{ translateY }] }
      ]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: color + '22', borderColor: color + '44' }]}>
              <Text style={styles.iconEmoji}>{emoji}</Text>
            </View>
            <View style={styles.headerText}>
              <View style={[styles.typeBadge, { backgroundColor: color + '22' }]}>
                <Text style={[styles.typeText, { color }]}>
                  {building.isEmergency ? '🚨 EMERGENCY · ' : ''}
                  {building.type.replace(/_/g, ' ')}
                </Text>
              </View>
              <Text style={styles.buildingName}>{building.name}</Text>
              {building.shortName && (
                <Text style={styles.shortName}>{building.shortName}</Text>
              )}
            </View>
          </View>

          {/* Image */}
          {building.imageUrl && (
            <Image
              source={{ uri: building.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          )}

          {/* Description */}
          {building.description && (
            <View style={styles.section}>
              <Text style={styles.description}>{building.description}</Text>
            </View>
          )}

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            {building.openingHours && (
              <InfoCard icon="🕐" label="Hours" value={building.openingHours} />
            )}
            {building.floor && (
              <InfoCard icon="🏢" label="Floors" value={`${building.floor} floors`} />
            )}
            {building.phone && (
              <InfoCard icon="📞" label="Phone" value={building.phone} />
            )}
            {building.email && (
              <InfoCard icon="📧" label="Email" value={building.email} />
            )}
            {building.address && (
              <InfoCard icon="📍" label="Address" value={building.address} fullWidth />
            )}
          </View>

          {/* Departments */}
          {building.departments && building.departments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Departments ({building.departments.length})
              </Text>
              {building.departments.map(dept => (
                <View key={dept.id} style={styles.deptRow}>
                  <View style={[styles.deptDot, { backgroundColor: color }]} />
                  <View style={styles.deptInfo}>
                    <Text style={styles.deptName}>{dept.name}</Text>
                    {dept.code && (
                      <Text style={styles.deptCode}>{dept.code}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Accessibility */}
          <View style={styles.accessRow}>
            <View style={[
              styles.accessBadge,
              { backgroundColor: building.isAccessible ? '#10B98122' : '#EF444422' }
            ]}>
              <Text style={{
                color: building.isAccessible ? '#10B981' : '#EF4444',
                fontSize: 12, fontWeight: '600',
              }}>
                {building.isAccessible ? '♿ Wheelchair Accessible' : '⚠️ Not Accessible'}
              </Text>
            </View>
          </View>

          {/* Coordinates */}
          <View style={styles.coordRow}>
            <Text style={styles.coordText}>
              📍 {building.latitude.toFixed(6)}°N, {building.longitude.toFixed(6)}°E
            </Text>
          </View>

          <View style={{ height: SIZES.xl }} />
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.navigateBtn}
            onPress={() => onNavigate(building)}
            activeOpacity={0.85}
          >
            <Text style={styles.navigateBtnText}>🧭 Navigate Here</Text>
          </TouchableOpacity>
          {building.isEmergency && (
            <TouchableOpacity
              style={styles.emergencyBtn}
              onPress={() => onNavigate(building)}
            >
              <Text style={styles.emergencyBtnText}>🚨 Emergency Route</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </>
  );
}

function InfoCard({
  icon, label, value, fullWidth
}: {
  icon: string; label: string; value: string; fullWidth?: boolean;
}) {
  return (
    <View style={[styles.infoCard, fullWidth && styles.infoCardFull]}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={fullWidth ? 3 : 2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: COLORS.panel,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
  },
  closeBtn: {
    position: 'absolute',
    top: SIZES.md,
    right: SIZES.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  closeBtnText: {
    color: COLORS.textDim,
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SIZES.md,
    paddingTop: SIZES.sm,
    gap: SIZES.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  iconEmoji: { fontSize: 26 },
  headerText: { flex: 1 },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SIZES.sm,
    paddingVertical: 3,
    borderRadius: 100,
    marginBottom: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  buildingName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 2,
  },
  shortName: {
    color: COLORS.textDim,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  image: {
    width: '100%',
    height: 140,
    marginBottom: SIZES.md,
  },
  section: {
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.md,
  },
  description: {
    color: COLORS.textDim,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: SIZES.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.md,
    gap: SIZES.sm,
    marginBottom: SIZES.md,
  },
  infoCard: {
    width: '47%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: SIZES.radiusSm,
    padding: SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    flexDirection: 'row',
    gap: SIZES.xs,
  },
  infoCardFull: { width: '100%' },
  infoIcon: { fontSize: 16 },
  infoContent: { flex: 1 },
  infoLabel: {
    color: COLORS.textDim,
    fontSize: 10,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '500',
  },
  deptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  deptDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  deptInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  deptName: { color: COLORS.text, fontSize: 14, fontWeight: '500', flex: 1 },
  deptCode: {
    color: COLORS.primary,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
    backgroundColor: COLORS.primaryDim,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  accessRow: {
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.sm,
  },
  accessBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SIZES.sm,
    paddingVertical: 5,
    borderRadius: SIZES.radiusSm,
  },
  coordRow: {
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.sm,
  },
  coordText: {
    color: COLORS.textDim,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  actions: {
    padding: SIZES.md,
    gap: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.panel,
  },
  navigateBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
    alignItems: 'center',
  },
  navigateBtnText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: '700',
  },
  emergencyBtn: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  emergencyBtnText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: '700',
  },
});
// AR button is accessed via NavigationScreen
