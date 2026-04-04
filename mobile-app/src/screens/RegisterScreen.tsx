import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { Field, PrimaryButton } from "../components/FormControls";
import { ScreenLayout, cardStyles } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { palette } from "../theme";

const registerDefaults = {
  full_name: "Ravi Kumar",
  email: "ravi+new@insureit.demo",
  phone_number: "9876501234",
  password: "demo123",
  city: "Bengaluru",
  zone: "Indiranagar",
  pincode: "560038",
  platform: "Zepto",
  avg_daily_earnings: "800",
};

export function RegisterScreen() {
  const { token, user, signIn, register, signOut } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [submitting, setSubmitting] = useState(false);
  const [loginEmail, setLoginEmail] = useState("ravi@insureit.demo");
  const [loginPassword, setLoginPassword] = useState("demo123");
  const [form, setForm] = useState(registerDefaults);

  const handleLogin = async () => {
    try {
      setSubmitting(true);
      await signIn(loginEmail, loginPassword);
    } catch (error) {
      Alert.alert("Login failed", `${error}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async () => {
    try {
      setSubmitting(true);
      await register({
        ...form,
        avg_daily_earnings: Number(form.avg_daily_earnings),
      });
    } catch (error) {
      Alert.alert("Registration failed", `${error}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (token && user) {
    return (
      <ScreenLayout
        title="Account"
        subtitle="Your frontend session is now connected to the live FastAPI backend."
      >
        <View style={cardStyles.card}>
          <Text style={styles.name}>{user.full_name}</Text>
          <Text style={styles.meta}>{user.email}</Text>
          <Text style={styles.meta}>
            {user.platform} rider in {user.zone}, {user.city}
          </Text>
          <Text style={styles.meta}>Risk score {user.risk_score}</Text>
          <PrimaryButton label="Sign out" onPress={signOut} tone="secondary" />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      title="Register"
      subtitle="Create a delivery partner profile or sign in with the seeded demo account to continue."
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={cardStyles.card}>
          <View style={styles.switchRow}>
            <PrimaryButton label="Demo Login" onPress={() => setMode("login")} tone="secondary" />
            <PrimaryButton label="New Register" onPress={() => setMode("register")} tone="secondary" />
          </View>

          {mode === "login" ? (
            <>
              <Field label="Email" value={loginEmail} onChangeText={setLoginEmail} autoCapitalize="none" />
              <Field label="Password" value={loginPassword} onChangeText={setLoginPassword} secureTextEntry />
              <PrimaryButton label="Sign in" onPress={handleLogin} disabled={submitting} />
            </>
          ) : (
            <>
              <Field label="Full name" value={form.full_name} onChangeText={(value) => setForm({ ...form, full_name: value })} />
              <Field label="Email" value={form.email} onChangeText={(value) => setForm({ ...form, email: value })} autoCapitalize="none" />
              <Field label="Phone number" value={form.phone_number} onChangeText={(value) => setForm({ ...form, phone_number: value })} keyboardType="phone-pad" />
              <Field label="Password" value={form.password} onChangeText={(value) => setForm({ ...form, password: value })} secureTextEntry />
              <Field label="City" value={form.city} onChangeText={(value) => setForm({ ...form, city: value })} />
              <Field label="Zone" value={form.zone} onChangeText={(value) => setForm({ ...form, zone: value })} />
              <Field label="Pincode" value={form.pincode} onChangeText={(value) => setForm({ ...form, pincode: value })} keyboardType="number-pad" />
              <Field label="Platform" value={form.platform} onChangeText={(value) => setForm({ ...form, platform: value })} />
              <Field
                label="Average daily earnings"
                value={form.avg_daily_earnings}
                onChangeText={(value) => setForm({ ...form, avg_daily_earnings: value })}
                keyboardType="decimal-pad"
              />
              <PrimaryButton label="Create account" onPress={handleRegister} disabled={submitting} />
            </>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  switchRow: {
    gap: 10,
    marginBottom: 14,
  },
  name: {
    color: palette.text,
    fontWeight: "800",
    fontSize: 24,
    marginBottom: 8,
  },
  meta: {
    color: palette.muted,
    marginBottom: 6,
  },
});
