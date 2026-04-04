import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { palette, radius, shadows } from '../theme';

export function AccountScreen() {
  const { user, updateProfile, logout } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
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
    if (!user) {
      return;
    }
    setForm({
      full_name: user.full_name || '',
      phone_number: user.phone_number || '',
      city: user.city || '',
      zone: user.zone || '',
      pincode: user.pincode || '',
      platform: user.platform || '',
      avg_daily_earnings: String(user.avg_daily_earnings || ''),
    });
  }, [user, showEditModal]);

  const details = [
    ['Email', user?.email || '--'],
    ['Phone', user?.phone_number || '--'],
    ['City', user?.city || '--'],
    ['Zone', user?.zone || '--'],
    ['Pincode', user?.pincode || '--'],
    ['Platform', user?.platform || '--'],
    ['Daily earnings', user?.avg_daily_earnings ? `Rs ${user.avg_daily_earnings}` : '--'],
  ];

  const setField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    if (
      !form.full_name ||
      !form.phone_number ||
      !form.city ||
      !form.zone ||
      !form.pincode ||
      !form.platform ||
      !form.avg_daily_earnings
    ) {
      Alert.alert('Incomplete profile', 'Please fill in all profile details before saving.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        full_name: form.full_name,
        phone_number: form.phone_number,
        city: form.city,
        zone: form.zone,
        pincode: form.pincode,
        platform: form.platform,
        avg_daily_earnings: Number(form.avg_daily_earnings),
      });
      setShowEditModal(false);
      Alert.alert('Profile updated', 'Your account details have been saved successfully.');
    } catch (error: any) {
      const message = `${error?.message || ''}`;
      if (message.includes('Phone number already exists')) {
        Alert.alert('Update failed', 'That phone number is already linked to another rider.');
      } else {
        Alert.alert('Update failed', 'We could not save your profile right now.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.full_name?.charAt(0)?.toUpperCase() || 'I'}</Text>
          </View>
          <Text style={styles.name}>{user?.full_name || 'InsureIt Rider'}</Text>
          <Text style={styles.subline}>{user?.platform || 'Platform'} delivery partner</Text>
          <View style={styles.riskBadge}>
            <Text style={styles.riskBadgeText}>Risk score {user?.risk_score ?? '--'}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => setShowEditModal(true)}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          {details.map(([label, value]) => (
            <View key={label} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{label}</Text>
              <Text style={styles.detailValue}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About InsureIt</Text>
          <Text style={styles.aboutText}>
            Parametric income insurance for last-mile riders. Once a verified disruption hits your working zone, the system triggers claim automation and payout confirmation without manual paperwork.
          </Text>
          <View style={styles.tagRow}>
            {['Weekly cover', 'Auto payouts', 'Claims simulator', 'Zone pricing'].map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={logout}>
          <Text style={styles.signOutButtonText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Text style={styles.modalSubtitle}>Update your rider details and working zone information.</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Field label="Full Name" value={form.full_name} onChangeText={(value) => setField('full_name', value)} />
              <Field label="Phone Number" value={form.phone_number} onChangeText={(value) => setField('phone_number', value)} keyboardType="phone-pad" />
              <Field label="City" value={form.city} onChangeText={(value) => setField('city', value)} />
              <Field label="Zone" value={form.zone} onChangeText={(value) => setField('zone', value)} />
              <Field label="Pincode" value={form.pincode} onChangeText={(value) => setField('pincode', value)} keyboardType="number-pad" />
              <Field label="Platform" value={form.platform} onChangeText={(value) => setField('platform', value)} />
              <Field
                label="Daily Earnings"
                value={form.avg_daily_earnings}
                onChangeText={(value) => setField('avg_daily_earnings', value)}
                keyboardType="decimal-pad"
              />
            </ScrollView>

            <TouchableOpacity style={styles.modalPrimaryButton} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalPrimaryButtonText}>Save Changes</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSecondaryButton} onPress={() => setShowEditModal(false)} disabled={saving}>
              <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

function Field({
  label,
  ...props
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'phone-pad' | 'number-pad' | 'decimal-pad';
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput {...props} style={styles.input} placeholderTextColor={palette.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  hero: {
    backgroundColor: palette.bgSoft,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 22,
    alignItems: 'center',
    ...shadows.card,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: palette.orangeDim,
    borderWidth: 2,
    borderColor: palette.orangeBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: palette.orangeLight,
    fontSize: 34,
    fontWeight: '800',
  },
  name: { color: palette.textPrimary, fontSize: 24, fontWeight: '800', marginTop: 14 },
  subline: { color: palette.textSecondary, marginTop: 6 },
  riskBadge: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: palette.bgCard,
    borderWidth: 1,
    borderColor: palette.border,
  },
  riskBadgeText: { color: palette.textSecondary, fontWeight: '700', fontSize: 12 },
  editButton: {
    marginTop: 16,
    backgroundColor: palette.orange,
    borderRadius: radius.md,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  section: {
    backgroundColor: palette.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: { color: palette.textPrimary, fontSize: 17, fontWeight: '800', marginBottom: 12 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: palette.borderLight,
  },
  detailLabel: { color: palette.textSecondary },
  detailValue: { color: palette.textPrimary, fontWeight: '700', maxWidth: '56%', textAlign: 'right' },
  aboutText: { color: palette.textSecondary, lineHeight: 20 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  tag: {
    backgroundColor: palette.bgElevated,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  tagText: { color: palette.textSecondary, fontSize: 12, fontWeight: '600' },
  signOutButton: {
    marginTop: 18,
    backgroundColor: palette.errorDim,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.error,
    paddingVertical: 15,
    alignItems: 'center',
  },
  signOutButtonText: { color: palette.error, fontWeight: '800', fontSize: 15 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.72)' },
  modalSheet: {
    backgroundColor: palette.bgCard,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 22,
    paddingBottom: 30,
    maxHeight: '88%',
  },
  modalHandle: {
    width: 42,
    height: 4,
    backgroundColor: palette.borderStrong,
    alignSelf: 'center',
    borderRadius: 2,
    marginBottom: 14,
  },
  modalTitle: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: palette.textSecondary,
    lineHeight: 19,
    marginTop: 6,
    marginBottom: 10,
  },
  fieldWrap: {
    marginTop: 12,
  },
  fieldLabel: {
    color: palette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    fontSize: 11,
    fontWeight: '700',
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
  modalPrimaryButton: {
    marginTop: 18,
    backgroundColor: palette.orange,
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
  },
  modalPrimaryButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  modalSecondaryButton: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalSecondaryButtonText: {
    color: palette.textSecondary,
    fontWeight: '700',
  },
});
