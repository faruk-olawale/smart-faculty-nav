import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity, Text, StyleSheet, Animated,
} from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

interface Props {
  isFollowing: boolean;
  onToggle: () => void;
}

export function FollowModeButton({ isFollowing, onToggle }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFollowing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [isFollowing]);

  function handlePress() {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle();
  }

  const opacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        isFollowing && styles.wrapperActive,
        {
          transform: [{ scale: scaleAnim }],
          opacity: isFollowing ? opacity : 1,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.btn}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>
          {isFollowing ? '🎯' : '⊙'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 48,
    height: 48,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  wrapperActive: {
    backgroundColor: COLORS.primaryDim,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.5,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 22 },
});
