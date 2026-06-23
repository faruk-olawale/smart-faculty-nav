import { useState, useRef, useCallback } from 'react';
import {
  useAudioRecorder,
  RecordingPresets,
  AudioModule,
  setAudioModeAsync,
} from 'expo-audio';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system/legacy';
import { assistantVoiceApi } from '../services/api';
import type { AIResponse } from '../types';

export type AssistantStatus =
  | 'idle'
  | 'recording'
  | 'processing'
  | 'speaking'
  | 'error';

export function useVoiceAssistant() {
  const [status, setStatus] = useState<AssistantStatus>('idle');
  const [lastReply, setLastReply] = useState<AIResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isRecordingRef = useRef(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const startRecording = useCallback(async () => {
    if (isRecordingRef.current) return;
    try {
      setErrorMessage(null);

      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        setErrorMessage('Microphone permission is needed to use voice navigation.');
        setStatus('error');
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        interruptionModeAndroid: 1,
        interruptionModeIOS: 1,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      isRecordingRef.current = true;
      setStatus('recording');
    } catch (e) {
      console.warn('[useVoiceAssistant] startRecording failed:', e);
      isRecordingRef.current = false;
      setErrorMessage('Could not start recording. Please try again.');
      setStatus('error');
    }
  }, [audioRecorder]);

  const stopRecordingAndSend = useCallback(async (
    context?: { userLat?: number; userLng?: number }
  ) => {
    if (!isRecordingRef.current) return null;

    try {
      setStatus('processing');
      await audioRecorder.stop();
      isRecordingRef.current = false;

      const uri = audioRecorder.uri;
      if (!uri) throw new Error('No recording URI');

      const audioBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const res = await assistantVoiceApi.queryVoice(audioBase64, 'audio/m4a', context);
      const reply = res.data as AIResponse;
      setLastReply(reply);

      setStatus('speaking');
      Speech.speak(reply.reply, {
        rate: 0.95,
        onDone: () => setStatus('idle'),
        onStopped: () => setStatus('idle'),
        onError: () => setStatus('idle'),
      });

      return reply;
    } catch (e) {
      console.warn('[useVoiceAssistant] stopRecordingAndSend failed:', e);
      isRecordingRef.current = false;
      setErrorMessage('Could not reach the assistant. Check your connection and try again.');
      setStatus('error');
      return null;
    }
  }, [audioRecorder]);

  const cancelRecording = useCallback(async () => {
    if (isRecordingRef.current) {
      try {
        await audioRecorder.stop();
      } catch {}
      isRecordingRef.current = false;
    }
    setStatus('idle');
  }, [audioRecorder]);

  const stopSpeaking = useCallback(() => {
    Speech.stop();
    setStatus('idle');
  }, []);

  return {
    status,
    lastReply,
    errorMessage,
    startRecording,
    stopRecordingAndSend,
    cancelRecording,
    stopSpeaking,
  };
}
