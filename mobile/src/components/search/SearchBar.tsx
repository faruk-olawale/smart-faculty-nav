import React, { useRef, useState } from 'react';
import {
  View, TextInput, TouchableOpacity,
  Text, StyleSheet, ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isSearching?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value, onChangeText, onClear,
  onFocus, onBlur, isSearching,
  placeholder = 'Search buildings, departments...',
  autoFocus = false,
}: Props) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, isFocused && styles.containerFocused]}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textDim}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onFocus={() => { setIsFocused(true); onFocus?.(); }}
        onBlur={() => { setIsFocused(false); onBlur?.(); }}
      />
      {isSearching && (
        <ActivityIndicator size="small" color={COLORS.primary} style={styles.spinner} />
      )}
      {value.length > 0 && !isSearching && (
        <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
          <Text style={styles.clearText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.panel,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.md,
    height: 48,
    gap: SIZES.sm,
  },
  containerFocused: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: { fontSize: 16 },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    paddingVertical: 0,
  },
  spinner: { marginLeft: SIZES.xs },
  clearBtn: {
    width: 24, height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: { color: COLORS.textDim, fontSize: 12, fontWeight: '700' },
});
