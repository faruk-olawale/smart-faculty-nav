import React from 'react';
import {
  View, Text, StyleSheet,
  ScrollView, TouchableOpacity,
} from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import type { RouteStep } from '../../types';

const MANEUVER_ICONS: Record<string, string> = {
  depart: '🟢',
  arrive: '🔴',
  turn: '↩️',
  'new name': '➡️',
  continue: '⬆️',
  merge: '↗️',
  roundabout: '🔄',
  fork: '⑂',
  default: '↗️',
};

interface Props {
  steps: RouteStep[];
  currentIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export function TurnByTurnPanel({
  steps, currentIndex, isExpanded, onToggle,
}: Props) {
  if (!steps || steps.length === 0) return null;

  const currentStep = steps[currentIndex];
  const nextStep = steps[currentIndex + 1];

  function getIcon(step: RouteStep) {
    return MANEUVER_ICONS[step.maneuver.type] || MANEUVER_ICONS.default;
  }

  function formatDist(meters: number) {
    return meters < 1000 ? `${Math.round(meters)}m` : `${(meters/1000).toFixed(1)}km`;
  }

  return (
    <View style={styles.container}>
      {/* Current step */}
      <TouchableOpacity
        style={styles.currentStep}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <View style={styles.currentIcon}>
          <Text style={styles.currentIconText}>
            {getIcon(currentStep)}
          </Text>
        </View>
        <View style={styles.currentText}>
          <Text style={styles.currentInstruction} numberOfLines={2}>
            {currentStep.instruction}
          </Text>
          {nextStep && (
            <Text style={styles.nextStep} numberOfLines={1}>
              Then: {nextStep.instruction}
            </Text>
          )}
        </View>
        <View style={styles.stepMeta}>
          <Text style={styles.stepDist}>
            {formatDist(currentStep.distance)}
          </Text>
          <Text style={styles.stepCount}>
            {currentIndex + 1}/{steps.length}
          </Text>
          <Text style={styles.expandIcon}>
            {isExpanded ? '▼' : '▲'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* All steps expanded */}
      {isExpanded && (
        <ScrollView
          style={styles.stepsList}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {steps.map((step, index) => (
            <View
              key={index}
              style={[
                styles.stepRow,
                index === currentIndex && styles.stepRowActive,
                index < currentIndex && styles.stepRowDone,
              ]}
            >
              <Text style={styles.stepIcon}>{getIcon(step)}</Text>
              <View style={styles.stepContent}>
                <Text style={[
                  styles.stepInstruction,
                  index === currentIndex && styles.stepInstructionActive,
                  index < currentIndex && styles.stepInstructionDone,
                ]}
                  numberOfLines={2}
                >
                  {step.instruction}
                </Text>
                <Text style={styles.stepDistance}>
                  {formatDist(step.distance)}
                </Text>
              </View>
              {index < currentIndex && (
                <Text style={styles.doneCheck}>✓</Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.panel,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  currentStep: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    gap: SIZES.sm,
  },
  currentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  currentIconText: { fontSize: 20 },
  currentText: { flex: 1 },
  currentInstruction: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  nextStep: {
    color: COLORS.textDim,
    fontSize: 12,
    marginTop: 3,
  },
  stepMeta: { alignItems: 'flex-end', gap: 2 },
  stepDist: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  stepCount: { color: COLORS.textDim, fontSize: 10 },
  expandIcon: { color: COLORS.textDim, fontSize: 12 },
  stepsList: { maxHeight: 240 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  stepRowActive: { backgroundColor: COLORS.primaryDim },
  stepRowDone: { opacity: 0.5 },
  stepIcon: { fontSize: 16, width: 24, textAlign: 'center' },
  stepContent: { flex: 1 },
  stepInstruction: { color: COLORS.textDim, fontSize: 13 },
  stepInstructionActive: { color: COLORS.text, fontWeight: '600' },
  stepInstructionDone: { textDecorationLine: 'line-through' },
  stepDistance: {
    color: COLORS.textDim,
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  doneCheck: { color: '#10B981', fontSize: 14, fontWeight: '700' },
});
