import { StyleSheet, Text, View } from 'react-native';

import { palette, radius, typography } from '../theme';

type Tone = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'orange';

const tones = {
  success: { backgroundColor: palette.successBg, color: palette.success, borderColor: palette.successBg },
  warning: { backgroundColor: palette.warningBg, color: palette.warning, borderColor: palette.warningBg },
  error: { backgroundColor: palette.errorBg, color: palette.error, borderColor: palette.errorBg },
  info: { backgroundColor: palette.infoBg, color: palette.info, borderColor: palette.infoBg },
  neutral: { backgroundColor: palette.bgMuted, color: palette.textSecondary, borderColor: palette.border },
  orange: { backgroundColor: palette.orangeTint, color: palette.orange, borderColor: palette.orangeBorder },
};

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const current = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: current.backgroundColor, borderColor: current.borderColor }]}>
      <Text style={[styles.label, { color: current.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    minHeight: 24,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: {
    ...typography.label,
    textTransform: 'uppercase',
  },
});
