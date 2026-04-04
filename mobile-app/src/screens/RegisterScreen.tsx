import React, { useState } from 'react';
import {
  ActivityIndicator,
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

import { useAuth } from '../context/AuthContext';
import { palette, radius, shadows } from '../theme';

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

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

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
      Alert.alert('Incomplete form', 'Please fill in all required fields before continuing.');
      return;
    }

    setLoading(true);
    try {
      await register({
        ...form,
        platform: form.platform,
        avg_daily_earnings: Number(form.avg_daily_earnings),
      });
    } catch (error: any) {
      const message = `${error?.message || ''}`;
      if (message.includes('already exists')) {
        Alert.alert('Account exists', 'A rider with this email or phone number is already registered.');
      } else {
        Alert.alert('Registration failed', 'Please try again after checking the backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.topPanel}>
          <Text style={styles.kicker}>New Rider Onboarding</Text>
          <Text style={styles.title}>Create your coverage profile.</Text>
          <Text style={styles.subtitle}>
            Build a delivery partner account, price the risk in your zone, and move straight into plan selection.
          </Text>
          <View style={styles.zoneStrip}>
            <MiniStat label="City" value="Bengaluru" />
            <MiniStat label="Cycle" value="Weekly" />
            <MiniStat label="Claims" value="Auto" />
          </View>
        </View>

        <View style={styles.card}>
          <FormField label="Full Name" value={form.full_name} onChangeText={(v) => set('full_name', v)} placeholder="Ravi Kumar" />
          <FormField label="Email" value={form.email} onChangeText={(v) => set('email', v)} placeholder="ravi@example.com" autoCapitalize="none" keyboardType="email-address" />
          <FormField label="Phone Number" value={form.phone_number} onChangeText={(v) => set('phone_number', v)} placeholder="9876543210" keyboardType="phone-pad" />
          <FormField label="Password" value={form.password} onChangeText={(v) => set('password', v)} placeholder="Minimum 6 characters" secureTextEntry />
          <FormField label="City" value={form.city} onChangeText={(v) => set('city', v)} placeholder="Bengaluru" />
          <FormField label="Zone / Area" value={form.zone} onChangeText={(v) => set('zone', v)} placeholder="Koramangala 4th Block" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <FormField label="Pincode" value={form.pincode} onChangeText={(v) => set('pincode', v)} placeholder="560034" keyboardType="number-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <FormField
                label="Daily Earnings"
                value={form.avg_daily_earnings}
                onChangeText={(v) => set('avg_daily_earnings', v)}
                placeholder="850"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <Text style={styles.label}>Platform</Text>
          <View style={styles.platformRow}>
            {PLATFORMS.map((platform) => {
              const active = form.platform === platform;
              return (
                <TouchableOpacity
                  key={platform}
                  style={[styles.platformButton, active && styles.platformButtonActive]}
                  onPress={() => set('platform', platform)}
                >
                  <Text style={[styles.platformButtonText, active && styles.platformButtonTextActive]}>{platform}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={[styles.primaryButton, loading && styles.disabled]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Create Account</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.footerLinkWrap} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerText}>Already registered?</Text>
          <Text style={styles.footerLink}>Back to sign in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FormField(props: any) {
  return (
    <View>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput {...props} style={styles.input} placeholderTextColor={palette.textMuted} />
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniValue}>{value}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  scroll: {
    padding: 22,
    paddingBottom: 40,
  },
  topPanel: {
    backgroundColor: palette.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 20,
    marginBottom: 18,
    ...shadows.card,
  },
  kicker: {
    color: palette.orangeLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 10,
    lineHeight: 34,
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  zoneStrip: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  miniStat: {
    flex: 1,
    backgroundColor: palette.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
  },
  miniValue: {
    color: palette.textPrimary,
    fontWeight: '800',
  },
  miniLabel: {
    color: palette.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  card: {
    backgroundColor: palette.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 20,
    ...shadows.card,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    color: palette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: palette.bgInput,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    color: palette.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  platformRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  platformButton: {
    flex: 1,
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  platformButtonActive: {
    backgroundColor: palette.orangeDim,
    borderColor: palette.orangeBorder,
  },
  platformButtonText: {
    color: palette.textSecondary,
    fontWeight: '700',
  },
  platformButtonTextActive: {
    color: palette.orangeLight,
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: palette.orange,
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  footerLinkWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
  },
  footerText: {
    color: palette.textSecondary,
  },
  footerLink: {
    color: palette.orangeLight,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
});
