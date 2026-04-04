import { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

import { palette } from "../theme";

type FieldProps = TextInputProps & {
  label: string;
};

type PrimaryButtonProps = {
  label: string;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  tone?: "primary" | "secondary";
  icon?: ReactNode;
};

export function Field({ label, style, ...props }: FieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={palette.muted}
        selectionColor={palette.primary}
        {...props}
      />
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  tone = "primary",
  icon,
}: PrimaryButtonProps) {
  const secondary = tone === "secondary";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        secondary ? styles.buttonSecondary : styles.buttonPrimary,
        disabled && styles.buttonDisabled,
      ]}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text
        style={[
          styles.buttonText,
          secondary ? styles.buttonTextSecondary : styles.buttonTextPrimary,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fieldWrap: {
    marginBottom: 14,
  },
  label: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  input: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    color: palette.text,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  button: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonPrimary: {
    backgroundColor: palette.primary,
  },
  buttonSecondary: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderWidth: 1,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  buttonTextPrimary: {
    color: "#ffffff",
  },
  buttonTextSecondary: {
    color: palette.text,
  },
  iconWrap: {
    marginRight: 8,
  },
});
