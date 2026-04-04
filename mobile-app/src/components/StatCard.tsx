import { StyleSheet, Text, View } from 'react-native';

import { Card } from './Card';
import { palette, typography } from '../theme';

export function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 14,
  },
  label: {
    ...typography.label,
    color: palette.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  value: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
});
