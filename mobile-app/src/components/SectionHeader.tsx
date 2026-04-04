import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, typography } from '../theme';

export function SectionHeader({
  label,
  title,
  actionLabel,
  onActionPress,
}: {
  label?: string;
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {actionLabel ? (
        <Pressable onPress={onActionPress}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  copy: {
    flex: 1,
  },
  label: {
    ...typography.label,
    color: palette.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    ...typography.displayMedium,
    color: palette.textPrimary,
  },
  action: {
    color: palette.orange,
    fontSize: 13,
    fontWeight: '700',
  },
});
