import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { GraduationCap } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_WIDTH = Math.min(SCREEN_WIDTH * 0.6, 260);

interface Props {
  slowHint?: string;
  slowHintDelay?: number;
}

export function LoadingScreen({
  slowHint = 'Waking up the server — first load can take up to a minute.',
  slowHintDelay = 6000,
}: Props) {
  const sweepAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showSlowHint, setShowSlowHint] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(sweepAnim, {
        toValue: 1,
        duration: 1100,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();

    const t = setTimeout(() => setShowSlowHint(true), slowHintDelay);
    return () => clearTimeout(t);
  }, []);

  const translateX = sweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-BAR_WIDTH * 0.6, BAR_WIDTH],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.iconWrap}>
          <GraduationCap size={56} color={COLORS.primary} strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>SMART CAMPUS NAV</Text>

        <View style={styles.barTrack}>
          <Animated.View
            style={[
              styles.barSweep,
              { transform: [{ translateX }] },
            ]}
          />
        </View>

        <Text style={styles.subtitle}>Loading campus data…</Text>

        {showSlowHint && (
          <Text style={styles.hint}>{slowHint}</Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 14,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 3,
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0,229,192,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  barTrack: {
    width: BAR_WIDTH,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(0,229,192,0.15)',
    overflow: 'hidden',
    marginTop: 10,
  },
  barSweep: {
    width: BAR_WIDTH * 0.45,
    height: '100%',
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  subtitle: {
    color: COLORS.textDim,
    fontSize: 13,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  hint: {
    color: COLORS.warning,
    fontSize: 11,
    textAlign: 'center',
    maxWidth: SCREEN_WIDTH * 0.75,
    lineHeight: 16,
    marginTop: 10,
  },
});
