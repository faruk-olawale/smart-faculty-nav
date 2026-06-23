import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SIZES } from '../constants/theme';

export default function AssistantScreen({ navigation }: any) {
  const {
    status, lastReply, errorMessage,
    startRecording, stopRecordingAndSend, cancelRecording, stopSpeaking,
  } = useVoiceAssistant();

  const { userLocation, buildings } = useAppStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'recording') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status]);

  async function handlePressIn() {
    await startRecording();
  }

  async function handlePressOut() {
    const reply = await stopRecordingAndSend(
      userLocation ? { userLat: userLocation.lat, userLng: userLocation.lng } : undefined
    );
    if (reply?.action?.targetId) {
      setTimeout(() => {
        const fullBuilding = buildings.find(b => b.id === reply.action!.targetId);

        const fallback = {
          id: reply.action!.targetId,
          name: reply.action!.name,
          latitude: reply.action!.targetLat,
          longitude: reply.action!.targetLng,
          type: 'OTHER',
        };

        const target = fullBuilding || fallback;

        if (reply.action!.type === 'navigate') {
          navigation.navigate('Navigation', { destination: target });
        } else if (reply.action!.type === 'show_building' || reply.action!.type === 'emergency') {
          navigation.navigate('Building', { building: target });
        }
      }, 600);
    }
  }

  const statusLabel: Record<string, string> = {
    idle: 'Hold to speak',
    recording: 'Listening…',
    processing: 'Thinking…',
    speaking: 'Speaking…',
    error: 'Something went wrong',
  };

  const statusColor =
    status === 'recording' ? COLORS.danger :
    status === 'processing' ? COLORS.warning :
    status === 'speaking' ? COLORS.primary :
    status === 'error' ? COLORS.danger :
    COLORS.textDim;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🤖 AI Assistant</Text>
        <Text style={styles.subtitle}>
          Hold the button and ask where you want to go
        </Text>
      </View>

      <ScrollView
        style={styles.conversation}
        contentContainerStyle={styles.conversationContent}
      >
        {!lastReply && !errorMessage && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎙️</Text>
            <Text style={styles.emptyTitle}>Ask me anything</Text>
            <Text style={styles.emptyText}>
              Try: "Where is the NLP Lab?"{'\n'}
              "Take me to the printing lab"{'\n'}
              "List all locations"
            </Text>
          </View>
        )}

        {lastReply && (
          <View style={styles.replyCard}>
            <Text style={styles.replyLabel}>ASSISTANT</Text>
            <Text style={styles.replyText}>{lastReply.reply}</Text>

            {lastReply.suggestions && lastReply.suggestions.length > 0 && (
              <View style={styles.suggestions}>
                {lastReply.suggestions.map((s, i) => (
                  <View key={i} style={styles.suggestionChip}>
                    <Text style={styles.suggestionText}>{s}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {errorMessage && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        )}
      </ScrollView>

      <Text style={[styles.statusLabel, { color: statusColor }]}>
        {statusLabel[status]}
      </Text>

      <View style={styles.buttonRow}>
        {status === 'speaking' ? (
          <TouchableOpacity style={styles.stopSpeakingBtn} onPress={stopSpeaking}>
            <Text style={styles.stopSpeakingText}>⏹ Stop speaking</Text>
          </TouchableOpacity>
        ) : (
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[
                styles.micButton,
                status === 'recording' && styles.micButtonActive,
                status === 'processing' && styles.micButtonProcessing,
              ]}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onLongPress={() => {}}
              disabled={status === 'processing'}
              activeOpacity={0.85}
            >
              <Text style={styles.micIcon}>
                {status === 'processing' ? '⏳' : '🎤'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {status === 'recording' && (
          <TouchableOpacity style={styles.cancelBtn} onPress={cancelRecording}>
            <Text style={styles.cancelBtnText}>✕ Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.textDim,
    fontSize: 13,
  },
  conversation: { flex: 1 },
  conversationContent: {
    padding: SIZES.md,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xxl,
    gap: SIZES.sm,
  },
  emptyIcon: { fontSize: 48, marginBottom: SIZES.sm },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  emptyText: {
    color: COLORS.textDim,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  replyCard: {
    backgroundColor: COLORS.panel,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.md,
    gap: SIZES.sm,
  },
  replyLabel: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  replyText: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 23,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.xs,
    marginTop: SIZES.xs,
  },
  suggestionChip: {
    backgroundColor: COLORS.primaryDim,
    borderRadius: 100,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    padding: SIZES.md,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  statusLabel: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: SIZES.sm,
  },
  buttonRow: {
    alignItems: 'center',
    paddingBottom: SIZES.xl,
    gap: SIZES.sm,
  },
  micButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  micButtonActive: {
    backgroundColor: COLORS.danger,
    shadowColor: COLORS.danger,
  },
  micButtonProcessing: {
    backgroundColor: COLORS.warning,
    shadowColor: COLORS.warning,
  },
  micIcon: { fontSize: 36 },
  cancelBtn: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: 100,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  cancelBtnText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  stopSpeakingBtn: {
    backgroundColor: COLORS.primaryDim,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stopSpeakingText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
