import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, BUILDING_COLORS, BUILDING_EMOJIS } from '../constants/theme';
import type { Building } from '../types';

export default function BuildingScreen({ route, navigation }: any) {
  const building: Building = route.params?.building;

  if (!building) {
    return (
      <View style={styles.container}>
        <Text style={{ color: COLORS.text }}>Building not found</Text>
      </View>
    );
  }

  const color = building.isEmergency
    ? COLORS.danger
    : (BUILDING_COLORS[building.type] || COLORS.primary);
  const emoji = BUILDING_EMOJIS[building.type] || '🏛️';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: color + '44' }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {building.shortName || building.name}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        {building.imageUrl ? (
          <Image
            source={{ uri: building.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.heroPlaceholder, { backgroundColor: color + '22' }]}>
            <Text style={styles.heroEmoji}>{emoji}</Text>
          </View>
        )}

        <View style={styles.content}>
          {/* Title */}
          <View style={[styles.typeBadge, { backgroundColor: color + '22' }]}>
            <Text style={[styles.typeText, { color }]}>
              {building.type.replace(/_/g, ' ')}
              {building.isEmergency ? ' · EMERGENCY' : ''}
            </Text>
          </View>
          <Text style={styles.name}>{building.name}</Text>
          {building.description && (
            <Text style={styles.description}>{building.description}</Text>
          )}

          {/* Info Cards */}
          <Text style={styles.sectionTitle}>Information</Text>
          <View style={styles.infoGrid}>
            {building.openingHours && (
              <InfoCard icon="🕐" label="Opening Hours" value={building.openingHours} fullWidth />
            )}
            {building.floor && (
              <InfoCard icon="🏢" label="Floors" value={`${building.floor} floors`} />
            )}
            {building.phone && (
              <InfoCard icon="📞" label="Phone" value={building.phone} />
            )}
            {building.email && (
              <InfoCard icon="📧" label="Email" value={building.email} fullWidth />
            )}
            {building.address && (
              <InfoCard icon="📍" label="Address" value={building.address} fullWidth />
            )}
            <InfoCard
              icon={building.isAccessible ? '♿' : '⚠️'}
              label="Accessibility"
              value={building.isAccessible ? 'Wheelchair Accessible' : 'Not Accessible'}
            />
          </View>

          {/* Departments */}
          {building.departments && building.departments.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>
                Departments ({building.departments.length})
              </Text>
              {building.departments.map(dept => (
                <View key={dept.id} style={styles.deptCard}>
                  <View style={[styles.deptAccent, { backgroundColor: color }]} />
                  <View style={styles.deptContent}>
                    <View style={styles.deptHeader}>
                      <Text style={styles.deptName}>{dept.name}</Text>
                      {dept.code && (
                        <View style={[styles.deptCodeBadge, { backgroundColor: color + '22' }]}>
                          <Text style={[styles.deptCode, { color }]}>{dept.code}</Text>
                        </View>
                      )}
                    </View>
                    {dept.hod && (
                      <Text style={styles.deptHod}>👤 HOD: {dept.hod}</Text>
                    )}
                    {dept.floor && dept.roomNumber && (
                      <Text style={styles.deptRoom}>
                        Floor {dept.floor} · Room {dept.roomNumber}
                      </Text>
                    )}
                    {dept.description && (
                      <Text style={styles.deptDesc} numberOfLines={2}>
                        {dept.description}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </>
          )}

          {/* Coordinates */}
          <View style={styles.coordCard}>
            <Text style={styles.coordLabel}>GPS Coordinates</Text>
            <Text style={styles.coordValue}>
              {building.latitude.toFixed(6)}°N, {building.longitude.toFixed(6)}°E
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: color }]}
          onPress={() => navigation.navigate('Navigation', { destination: building })}
          activeOpacity={0.85}
        >
          <Text style={styles.navBtnText}>🧭 Navigate to {building.shortName || building.name}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoCard({
  icon, label, value, fullWidth,
}: {
  icon: string; label: string; value: string; fullWidth?: boolean;
}) {
  return (
    <View style={[styles.infoCard, fullWidth && styles.infoCardFull]}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    paddingTop: 52,
    borderBottomWidth: 1,
  },
  backBtn: { width: 60 },
  backBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  headerTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },
  heroImage: { width: '100%', height: 200 },
  heroPlaceholder: {
    width: '100%', height: 160,
    alignItems: 'center', justifyContent: 'center',
  },
  heroEmoji: { fontSize: 64 },
  content: { padding: SIZES.md },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SIZES.sm,
    paddingVertical: 3,
    borderRadius: 100,
    marginBottom: SIZES.sm,
  },
  typeText: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  name: { color: COLORS.text, fontSize: 22, fontWeight: '700', marginBottom: SIZES.sm, lineHeight: 28 },
  description: { color: COLORS.textDim, fontSize: 14, lineHeight: 20, marginBottom: SIZES.lg },
  sectionTitle: {
    color: COLORS.text, fontSize: 12, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1,
    marginBottom: SIZES.sm, marginTop: SIZES.sm,
  },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm, marginBottom: SIZES.lg },
  infoCard: {
    width: '47%', backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: SIZES.radiusSm, padding: SIZES.sm,
    borderWidth: 1, borderColor: COLORS.borderLight,
    flexDirection: 'row', gap: SIZES.xs,
  },
  infoCardFull: { width: '100%' },
  infoIcon: { fontSize: 18 },
  infoLabel: { color: COLORS.textDim, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  infoValue: { color: COLORS.text, fontSize: 12, fontWeight: '500' },
  deptCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: SIZES.radiusSm,
    marginBottom: SIZES.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  deptAccent: { width: 4 },
  deptContent: { flex: 1, padding: SIZES.sm },
  deptHeader: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, marginBottom: 4 },
  deptName: { color: COLORS.text, fontSize: 14, fontWeight: '700', flex: 1 },
  deptCodeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  deptCode: { fontSize: 11, fontFamily: 'monospace', fontWeight: '700' },
  deptHod: { color: COLORS.textDim, fontSize: 12, marginBottom: 2 },
  deptRoom: { color: COLORS.primary, fontSize: 11, fontFamily: 'monospace', marginBottom: 4 },
  deptDesc: { color: COLORS.textDim, fontSize: 12, lineHeight: 16 },
  coordCard: {
    backgroundColor: 'rgba(0,229,192,0.08)',
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SIZES.md,
    marginBottom: SIZES.xl,
  },
  coordLabel: { color: COLORS.textDim, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  coordValue: { color: COLORS.primary, fontSize: 13, fontFamily: 'monospace', fontWeight: '600' },
  bottomAction: {
    padding: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.panel,
  },
  navBtn: {
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
    alignItems: 'center',
  },
  navBtnText: { color: COLORS.background, fontSize: 15, fontWeight: '700' },
});
