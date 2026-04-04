import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { palette, radius, typography } from '../theme';

const PLATFORMS = ['Zepto', 'Blinkit'];

export function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
    city: 'Bengaluru',
    zone: '',
    pincode: '',
    platform: 'Zepto',
    avg_daily_earnings: '',
  });

  const setField = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleRegister = async () => {
    if (
      !form.full_name ||
      !form.email ||
      !form.phone_number ||
      !form.password ||
      !form.zone ||
      !form.pincode ||
      !form.avg_daily_earnings
    ) {
      Alert.alert('Incomplete form', 'Please fill in all required rider details.');
      return;
    }

    setLoading(true);
    try {
      await register({
        ...form,
        avg_daily_earnings: Number(form.avg_daily_earnings),
      });
    } catch {
      Alert.alert('Registration failed', 'Please try again after checking the backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Card style={styles.card} elevated>
          <Section title="Personal Info" />
          <View style={styles.grid}>
            <Field label="Full Name" value={form.full_name} onChangeText={(v: string) => setField('full_name', v)} />
            <Field label="Email" value={form.email} onChangeText={(v: string) => setField('email', v)} autoCapitalize="none" keyboardType="email-address" />
            <Field label="Phone" value={form.phone_number} onChangeText={(v: string) => setField('phone_number', v)} keyboardType="phone-pad" />
            <Field label="Password" value={form.password} onChangeText={(v: string) => setField('password', v)} secureTextEntry />
          </View>

          <Section title="Location" />
          <View style={styles.grid}>
            <Field label="City" value={form.city} onChangeText={(v: string) => setField('city', v)} />
            <Field label="Zone" value={form.zone} onChangeText={(v: string) => setField('zone', v)} />
            <Field label="Pincode" value={form.pincode} onChangeText={(v: string) => setField('pincode', v)} keyboardType="number-pad" />
            <Field
              label="Daily Earnings"
              value={form.avg_daily_earnings}
              onChangeText={(v: string) => setField('avg_daily_earnings', v)}
              keyboardType="decimal-pad"
            />
          </View>

          <Section title="Platform" />
          <View style={styles.platformRow}>
            {PLATFORMS.map((platform) => {
              const active = platform === form.platform;
              return (
                <TouchableOpacity
                  key={platform}
                  onPress={() => setField('platform', platform)}
                  style={[styles.platformPill, active && styles.platformPillActive]}
                >
                  <Text style={[styles.platformLabel, active && styles.platformLabelActive]}>{platform}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.submit}>
            <PrimaryButton label="Create Account" onPress={handleRegister} loading={loading} />
          </View>

          <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerText}>Already registered? </Text>
            <Text style={styles.footerAction}>Sign in</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field(props: any) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <TextInput {...props} placeholderTextColor={palette.textMuted} style={styles.input} />
    </View>
  );
}

function Section({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  scroll: { padding: 16, paddingBottom: 36 },
  card: { padding: 20 },
  sectionTitle: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 4,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  field: {
    width: '48%',
  },
  fieldLabel: {
    ...typography.label,
    color: palette.textSecondary,
    marginBottom: 6,
  },
  input: {
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.bgInput,
    paddingHorizontal: 14,
    color: palette.textPrimary,
  },
  platformRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  platformPill: {
    flex: 1,
    minHeight: 42,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.bgSurface,
  },
  platformPillActive: {
    backgroundColor: palette.orangeTint,
    borderColor: palette.orangeBorder,
  },
  platformLabel: {
    color: palette.textSecondary,
    fontWeight: '700',
  },
  platformLabelActive: {
    color: palette.orange,
  },
  submit: {
    marginTop: 18,
  },
  footerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: palette.textSecondary,
  },
  footerAction: {
    color: palette.orange,
    fontWeight: '700',
  },
});
