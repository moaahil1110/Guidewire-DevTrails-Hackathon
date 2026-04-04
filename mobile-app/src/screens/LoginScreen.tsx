import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Field, PrimaryButton } from "../components/FormControls";
import { ScreenLayout, cardStyles } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { palette } from "../theme";

const DEMO_EMAIL = "ravi@insureit.demo";
const DEMO_PASSWORD = "demo123";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LoginScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleDemoFill = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError("");
  };

  const handleLogin = async () => {
    const nextEmail = email.trim();

    if (!isValidEmail(nextEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await signIn(nextEmail, password);
    } catch (loginError) {
      setError(`${loginError}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout
      title="Login"
      subtitle="Sign in with the seeded demo user or your registered delivery partner account."
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={cardStyles.card}>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.copy}>
            Use the demo account for quick testing, or sign in with an account created from the
            register flow.
          </Text>

          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error.replace(/^Error:\s*/, "")}</Text> : null}

          <PrimaryButton label="Demo Login" onPress={handleDemoFill} tone="secondary" />
          <PrimaryButton label="Sign In" onPress={handleLogin} disabled={submitting} />

          <View style={styles.footer}>
            <Text style={styles.footerCopy}>Need a new account?</Text>
            <Text style={styles.footerLink} onPress={() => navigation.navigate("Register")}>
              Create one here
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: palette.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
  },
  copy: {
    color: palette.muted,
    lineHeight: 20,
    marginBottom: 16,
  },
  error: {
    color: palette.danger,
    fontWeight: "600",
    marginBottom: 8,
  },
  footer: {
    alignItems: "center",
    marginTop: 14,
  },
  footerCopy: {
    color: palette.muted,
    marginBottom: 4,
  },
  footerLink: {
    color: palette.primary,
    fontWeight: "700",
  },
});
