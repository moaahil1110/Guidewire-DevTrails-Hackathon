import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { palette, radius } from '../theme';

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
      ]}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: palette.orange,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.7,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
