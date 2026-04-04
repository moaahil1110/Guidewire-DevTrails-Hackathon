import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Field, PrimaryButton } from "../components/FormControls";
import { ScreenLayout, cardStyles } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { palette } from "../theme";

function createDefaultEmail() {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `ravi+${suffix}@insureit.demo`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  return /^\d{10}$/.test(value);
}

function isValidPincode(value: string) {
  return /^\d{6}$/.test(value);
}

export function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const defaultEmail = useMemo(() => createDefaultEmail(), []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "Ravi Kumar",
    email: defaultEmail,
    phone_number: "9876501234",
    password: "demo123",
    city: "Bengaluru",
    zone: "Indiranagar",
    pincode: "560038",
    platform: "Zepto",
    avg_daily_earnings: "800",
  });

  const setField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validateForm = () => {
    if (!form.full_name.trim()) {
      return "Full name is required.";
    }
    if (!isValidEmail(form.email.trim())) {
      return "Enter a valid email address.";
    }
    if (!isValidPhone(form.phone_number.trim())) {
      return "Phone number must be exactly 10 digits.";
    }
    if (form.password.length < 6) {
      return "Password must be at least 6 characters.";
    }
    if (!form.city.trim()) {
      return "City is required.";
    }
    if (!form.zone.trim()) {
      return "Zone is required.";
    }
    if (!isValidPincode(form.pincode.trim())) {
      return "Pincode must be exactly 6 digits.";
    }
    const earnings = Number(form.avg_daily_earnings);
    if (!Number.isFinite(earnings) || earnings <= 0) {
      return "Average daily earnings must be a positive number.";
    }
    return "";
  };

  const handleRegister = async () => {
    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await register({
        ...form,
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
        city: form.city.trim(),
        zone: form.zone.trim(),
        pincode: form.pincode.trim(),
        avg_daily_earnings: Number(form.avg_daily_earnings),
      });
    } catch (registerError) {
      setError(`${registerError}`.replace(/^Error:\s*/, ""));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout
      title="Register"
      subtitle="Create a delivery partner profile for the mobile app and start pulling live quotes from the backend."
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={cardStyles.card}>
          <Text style={styles.heading}>Create your account</Text>
          <Text style={styles.copy}>
            The default email is randomized so repeated demo registrations do not collide with an
            earlier seeded test account.
          </Text>

          <Field
            label="Full name"
            value={form.full_name}
            onChangeText={(value) => setField("full_name", value)}
          />
          <Field
            label="Email"
            value={form.email}
            onChangeText={(value) => setField("email", value)}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Field
            label="Phone number"
            value={form.phone_number}
            onChangeText={(value) => setField("phone_number", value)}
            keyboardType="phone-pad"
          />
          <Field
            label="Password"
            value={form.password}
            onChangeText={(value) => setField("password", value)}
            secureTextEntry
          />
          <Field
            label="City"
            value={form.city}
            onChangeText={(value) => setField("city", value)}
          />
          <Field
            label="Zone"
            value={form.zone}
            onChangeText={(value) => setField("zone", value)}
          />
          <Field
            label="Pincode"
            value={form.pincode}
            onChangeText={(value) => setField("pincode", value)}
            keyboardType="number-pad"
          />
          <Field
            label="Platform"
            value={form.platform}
            onChangeText={(value) => setField("platform", value)}
          />
          <Field
            label="Average daily earnings"
            value={form.avg_daily_earnings}
            onChangeText={(value) => setField("avg_daily_earnings", value)}
            keyboardType="decimal-pad"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton label="Create account" onPress={handleRegister} disabled={submitting} />

          <View style={styles.footer}>
            <Text style={styles.footerCopy}>Already registered?</Text>
            <Text style={styles.footerLink} onPress={() => navigation.navigate("Login")}>
              Go to login
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
