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
import { OutlineButton } from '../components/OutlineButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { palette, radius, typography } from '../theme';

export function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('ravi@insureit.demo');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Use your account or the demo credentials below.');
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

  const handleDemo = async () => {
    setEmail('ravi@insureit.demo');
    setPassword('demo123');
    setLoading(true);
    try {
      await login('ravi@insureit.demo', 'demo123');
    } catch {
      Alert.alert('Demo login failed', 'Please make sure the backend is available.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.branding}>
          <Text style={styles.logo}>InsureIt</Text>
          <Text style={styles.tagline}>Income protection for delivery partners</Text>
          <View style={styles.metricRow}>
            <Metric value="<90s" label="Payouts" />
            <Metric value="24×7" label="Coverage" />
            <Metric value="3 tiers" label="Plans" />
          </View>
        </View>

        <Card style={styles.formCard} elevated>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>Use your account or the demo credentials below.</Text>

          <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />

          <View style={styles.actions}>
            <PrimaryButton label="Enter Dashboard" onPress={handleLogin} loading={loading} />
            <OutlineButton label="Use Demo Credentials" onPress={handleDemo} disabled={loading} />
          </View>

          <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <Text style={styles.footerAction}>Create one</Text>
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
      <TextInput
        {...props}
        placeholderTextColor={palette.textMuted}
        style={styles.input}
      />
    </View>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <Card style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  branding: {
    backgroundColor: palette.orangeTint,
    borderBottomLeftRadius: radius['2xl'],
    borderBottomRightRadius: radius['2xl'],
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 34,
    borderBottomWidth: 1,
    borderBottomColor: palette.orangeBorder,
  },
  logo: {
    ...typography.displayLarge,
    color: palette.orange,
  },
  tagline: {
    marginTop: 6,
    color: palette.textMuted,
    fontSize: 13,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  metricCard: {
    flex: 1,
    padding: 12,
  },
  metricValue: {
    color: palette.orange,
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    marginTop: 4,
    color: palette.textMuted,
    fontSize: 11,
  },
  formCard: {
    marginHorizontal: 16,
    marginTop: -20,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 12,
    color: palette.textSecondary,
    fontSize: 13,
  },
  field: {
    marginTop: 12,
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
  actions: {
    gap: 10,
    marginTop: 18,
  },
  footerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  footerText: {
    color: palette.textSecondary,
  },
  footerAction: {
    color: palette.orange,
    fontWeight: '700',
  },
});
