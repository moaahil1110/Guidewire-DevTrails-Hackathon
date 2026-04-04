import { StyleSheet, Text, View } from "react-native";

import { palette, radius } from "../theme";

type StatusPillProps = {
  status: string;
};

function getStatusStyles(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "paid") {
    return {
      backgroundColor: "#e4f3ea",
      borderColor: "#b7d8c2",
      textColor: palette.success,
      label: "Paid",
    };
  }

  if (normalized === "approved") {
    return {
      backgroundColor: "#e2f0f2",
      borderColor: "#b4d0d3",
      textColor: palette.primary,
      label: "Approved",
    };
  }

  if (normalized === "flagged") {
    return {
      backgroundColor: "#fff0d8",
      borderColor: "#f0cf8f",
      textColor: palette.warning,
      label: "Flagged",
    };
  }

  if (normalized === "rejected") {
    return {
      backgroundColor: "#fde7e3",
      borderColor: "#efbbb1",
      textColor: palette.danger,
      label: "Rejected",
    };
  }

  return {
    backgroundColor: "#f0ede5",
    borderColor: palette.border,
    textColor: palette.muted,
    label: status,
  };
}

export function StatusPill({ status }: StatusPillProps) {
  const tone = getStatusStyles(status);

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: tone.backgroundColor,
          borderColor: tone.borderColor,
        },
      ]}
    >
      <Text style={[styles.text, { color: tone.textColor }]}>{tone.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});
