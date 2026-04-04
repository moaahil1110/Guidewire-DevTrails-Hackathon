import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { palette } from "../theme";

export function ScreenLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: palette.bgCard,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  label: {
    color: palette.textSecondary,
    fontSize: 13,
    marginBottom: 6,
  },
  value: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  hero: {
    paddingVertical: 18,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});
