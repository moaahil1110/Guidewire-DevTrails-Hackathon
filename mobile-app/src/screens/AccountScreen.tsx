import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Badge } from '../components/Badge';
import { BottomSheet } from '../components/BottomSheet';
import { Card } from '../components/Card';
import { OutlineButton } from '../components/OutlineButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { palette, radius, typography } from '../theme';
import { formatCurrency } from '../utils/format';

export function AccountScreen() {
  const { user, updateProfile, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone_number: '',
    city: '',
    zone: '',
    pincode: '',
    platform: '',
    avg_daily_earnings: '',
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      full_name: user.full_name,
      phone_number: user.phone_number,
      city: user.city,
      zone: user.zone,
      pincode: user.pincode,
      platform: user.platform,
      avg_daily_earnings: String(user.avg_daily_earnings),
    });
  }, [user, editing]);

  const details = [
    ['Email', user?.email || '--'],
    ['Phone', user?.phone_number || '--'],
    ['City', user?.city || '--'],
    ['Zone', user?.zone || '--'],
    ['Pincode', user?.pincode || '--'],
    ['Platform', user?.platform || '--'],
    ['Daily Earnings', formatCurrency(user?.avg_daily_earnings)],
  ];

  const setField = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        ...form,
        avg_daily_earnings: Number(form.avg_daily_earnings),
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
        <Card style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.full_name?.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'IR'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.full_name || 'InsureIt Rider'}</Text>
          <Text style={styles.subline}>{user?.platform || 'Platform'} • {user?.zone || 'Zone'}</Text>
          <Badge label={`Risk Score ${user?.risk_score ?? '--'}`} tone="neutral" />
          <View style={styles.heroActions}>
            <OutlineButton label="Edit Profile" onPress={() => setEditing(true)} />
            <TouchableOpacity onPress={logout}>
              <Text style={styles.signOut}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Account Details</Text>
          {details.map(([label, value]) => (
            <View key={label} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{label}</Text>
              <Text style={styles.detailValue}>{value}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Parametric income insurance for last-mile riders with automated disruption-triggered payouts.
          </Text>
          <View style={styles.pillRow}>
            {['Weekly cover', 'Auto payouts', 'Claims simulator', 'Zone pricing'].map((pill) => (
              <View key={pill} style={styles.featurePill}>
                <Text style={styles.featurePillText}>{pill}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>

      <BottomSheet visible={editing} onClose={() => setEditing(false)}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.modalContent}>
            <Field label="Full Name" value={form.full_name} onChangeText={(v: string) => setField('full_name', v)} />
            <Field label="Phone Number" value={form.phone_number} onChangeText={(v: string) => setField('phone_number', v)} />
            <Field label="City" value={form.city} onChangeText={(v: string) => setField('city', v)} />
            <Field label="Zone" value={form.zone} onChangeText={(v: string) => setField('zone', v)} />
            <View style={styles.twoCol}>
              <Field label="Pincode" value={form.pincode} onChangeText={(v: string) => setField('pincode', v)} />
              <Field label="Earnings" value={form.avg_daily_earnings} onChangeText={(v: string) => setField('avg_daily_earnings', v)} />
            </View>
            <Field label="Platform" value={form.platform} onChangeText={(v: string) => setField('platform', v)} />
            <PrimaryButton label="Save Changes" onPress={handleSave} loading={saving} />
            <TouchableOpacity onPress={() => setEditing(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </BottomSheet>
    </>
  );
}

function Field(props: any) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <TextInput {...props} placeholderTextColor={palette.textMuted} style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  scroll: { padding: 16, paddingBottom: 32, gap: 16 },
  hero: { alignItems: 'center', gap: 10 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: palette.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: palette.orange, fontSize: 28, fontWeight: '800' },
  name: { color: palette.textPrimary, fontSize: 20, fontWeight: '800' },
  subline: { color: palette.textMuted, fontSize: 13 },
  heroActions: { width: '100%', gap: 12, marginTop: 6 },
  signOut: { textAlign: 'center', color: palette.error, fontWeight: '700' },
  sectionTitle: { color: palette.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  detailLabel: { color: palette.textMuted, fontSize: 12 },
  detailValue: { color: palette.textPrimary, fontSize: 14, fontWeight: '700', maxWidth: '54%', textAlign: 'right' },
  aboutText: { color: palette.textSecondary, lineHeight: 20 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  featurePill: {
    backgroundColor: palette.bgMuted,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  featurePillText: { color: palette.textSecondary, fontSize: 12, fontWeight: '700' },
  modalContent: { gap: 14, paddingBottom: 6 },
  fieldWrap: { flex: 1 },
  fieldLabel: { ...typography.label, color: palette.textSecondary, marginBottom: 6 },
  input: {
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.bgInput,
    paddingHorizontal: 14,
    color: palette.textPrimary,
  },
  twoCol: { flexDirection: 'row', gap: 12 },
  cancelText: { textAlign: 'center', color: palette.orange, fontWeight: '700' },
});
