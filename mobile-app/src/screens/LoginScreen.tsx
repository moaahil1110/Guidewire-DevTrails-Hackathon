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

export function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('ravi@insureit.demo');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Enter your email and password to continue.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch {
      Alert.alert('Sign in failed', 'Please check your credentials and confirm the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('ravi@insureit.demo');
    setPassword('demo123');
    setLoading(true);
    try {
      await login('ravi@insureit.demo', 'demo123');
    } catch {
      Alert.alert('Demo login failed', 'Please make sure the backend server is available.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>IN</Text>
            </View>
            <View>
              <Text style={styles.brandName}>InsureIt</Text>
              <Text style={styles.brandTag}>Income protection for delivery partners</Text>
            </View>
          </View>

          <View style={styles.heroPanel}>
            <Text style={styles.kicker}>Coverage Active</Text>
            <Text style={styles.heroTitle}>Protect every working hour.</Text>
            <Text style={styles.heroCopy}>
              Monitor disruptions, activate claims instantly, and keep riders informed with one clean mobile flow.
            </Text>
            <View style={styles.metricsRow}>
              <Metric value="<90s" label="Payout demo" />
              <Metric value="24x7" label="Coverage" />
              <Metric value="3 tiers" label="Plans" />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardSubtitle}>Use the seeded demo account or your registered profile.</Text>

          <Label text="Email" />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="rider@insureit.demo"
            placeholderTextColor={palette.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Label text="Password" />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor={palette.textMuted}
            secureTextEntry
          />

          <TouchableOpacity style={[styles.primaryButton, loading && styles.disabled]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Enter Dashboard</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleDemoLogin} disabled={loading}>
            <Text style={styles.secondaryButtonText}>Use Demo Credentials</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.footerLinkWrap} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.footerText}>Need an account?</Text>
          <Text style={styles.footerLink}>Create one now</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  scroll: {
    flexGrow: 1,
    padding: 22,
    justifyContent: 'center',
  },
  hero: {
    marginBottom: 18,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  brandMark: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: palette.orangeDim,
    borderWidth: 1,
    borderColor: palette.orangeBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: palette.orangeLight,
    fontWeight: '800',
    letterSpacing: 1,
  },
  brandName: {
    color: palette.textPrimary,
    fontSize: 26,
    fontWeight: '800',
  },
  brandTag: {
    color: palette.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  heroPanel: {
    backgroundColor: palette.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 20,
    ...shadows.card,
  },
  kicker: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    overflow: 'hidden',
    backgroundColor: palette.successDim,
    color: palette.success,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 12,
  },
  heroTitle: {
    color: palette.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  heroCopy: {
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  metricCard: {
    flex: 1,
    backgroundColor: palette.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
  },
  metricValue: {
    color: palette.orangeLight,
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
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
  cardTitle: {
    color: palette.textPrimary,
    fontSize: 21,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: palette.textSecondary,
    marginTop: 6,
    marginBottom: 12,
    lineHeight: 19,
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
  primaryButton: {
    marginTop: 18,
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
  secondaryButton: {
    marginTop: 10,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.orangeBorder,
    backgroundColor: palette.orangeDim,
  },
  secondaryButtonText: {
    color: palette.orangeSoft,
    fontWeight: '700',
    fontSize: 14,
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
