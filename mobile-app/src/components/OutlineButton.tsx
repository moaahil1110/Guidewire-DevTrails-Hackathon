import { Pressable, StyleSheet, Text } from 'react-native';

import { palette, radius } from '../theme';

export function OutlineButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.orange,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  label: {
    color: palette.orange,
    fontSize: 14,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.65,
  },
  pressed: {
    backgroundColor: palette.orangeTint,
  },
});
