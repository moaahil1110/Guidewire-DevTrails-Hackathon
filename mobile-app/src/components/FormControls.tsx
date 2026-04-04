import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from "react-native";

import { palette } from "../theme";

export function Field({
  label,
  ...props
}: TextInputProps & {
  label: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={palette.textMuted} style={styles.input} {...props} />
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  tone = "primary",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: "primary" | "secondary";
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        tone === "primary" ? styles.primaryButton : styles.secondaryButton,
        disabled ? styles.disabledButton : null,
      ]}
    >
      <Text style={tone === "primary" ? styles.primaryText : styles.secondaryText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fieldWrap: {
    marginBottom: 14,
  },
  label: {
    color: palette.textPrimary,
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.bgInput,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: palette.textPrimary,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  primaryButton: {
    backgroundColor: palette.orange,
  },
  secondaryButton: {
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.border,
  },
  primaryText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  secondaryText: {
    color: palette.textPrimary,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
