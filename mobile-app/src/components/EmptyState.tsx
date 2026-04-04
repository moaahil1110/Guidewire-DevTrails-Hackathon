import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "./FormControls";
import { palette, radius, spacing } from "../theme";

type EmptyStateProps = {
  icon?: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onPressCta?: () => void;
};

export function EmptyState({
  icon = "ℹ️",
  title,
  subtitle,
  ctaLabel,
  onPressCta,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {ctaLabel && onPressCta ? (
        <View style={styles.buttonWrap}>
          <PrimaryButton label={ctaLabel} onPress={onPressCta} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  icon: {
    fontSize: 34,
    marginBottom: spacing.sm,
  },
  title: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  buttonWrap: {
    marginTop: spacing.md,
    minWidth: 180,
    width: "100%",
  },
});
