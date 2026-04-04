import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { api } from '../api/client';
import { Badge } from '../components/Badge';
import { BottomSheet } from '../components/BottomSheet';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { palette, radius, typography } from '../theme';
import { formatCurrency, getDisplayedQuotePrice, getTierLabel } from '../utils/format';
import type { CoverageTier } from '../types';

const TIERS = [
  { id: 'basic' as CoverageTier, subtitle: 'Weather-first protection for lighter risk zones.', points: ['Rain protection', 'Heat advisory', 'Fast claims'] },
  { id: 'shield' as CoverageTier, subtitle: 'Balanced weekly protection for urban disruptions.', points: ['Rain protection', 'Social disruption cover', 'Priority claims'], featured: true },
  { id: 'max' as CoverageTier, subtitle: 'Higher limits for intense zones and longer shifts.', points: ['Rain protection', 'Platform downtime', 'Extended hours'] },
];

const PAYMENT_METHODS = ['UPI', 'Card', 'Wallet'];

export function PremiumScreen() {
  const { token, user } = useAuth();
  const [quotes, setQuotes] = useState<Record<string, any>>({});
  const [selectedTier, setSelectedTier] = useState<(typeof TIERS)[number] | null>(null);
  const [selectedPayment, setSelectedPayment] = useState('UPI');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchQuotes = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const results = await Promise.all(TIERS.map((tier) => api.quote(token, tier.id)));
        const nextQuotes: Record<string, any> = {};
        TIERS.forEach((tier, index) => {
          nextQuotes[tier.id] = results[index];
        });
        setQuotes(nextQuotes);
      } finally {
        setLoading(false);
      }
    };

    void fetchQuotes();
  }, [token]);

  const confirmPurchase = async () => {
    if (!token || !selectedTier) return;
    setPurchasing(true);
    try {
      await api.purchasePolicy(token, selectedTier.id);
      setSuccess(true);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>Transparent weekly coverage tailored to your zone risk.</Text>
          <View style={styles.headerBadges}>
            <Badge label={user?.zone || 'Zone'} tone="neutral" />
            <Badge label={`Risk ${user?.risk_score ?? '--'}`} tone="warning" />
          </View>
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading quotes…</Text>
        ) : (
          <View style={styles.stack}>
            {TIERS.map((tier) => {
              const quote = quotes[tier.id];
              return (
                <Card
                  key={tier.id}
                  style={[styles.planCard, tier.featured ? styles.planCardFeatured : null]}
                  elevated={!!tier.featured}
                >
                  <View style={styles.planTop}>
                    <View>
                      <Text style={styles.planName}>{getTierLabel(tier.id)}</Text>
                      <Text style={styles.planSubtitle}>{tier.subtitle}</Text>
                    </View>
                    {tier.featured ? <Badge label="Popular" tone="orange" /> : null}
                  </View>

                  <Text style={styles.planPrice}>{formatCurrency(getDisplayedQuotePrice(tier.id, quote))}</Text>
                  <Text style={styles.planPerWeek}>per week</Text>

                  <View style={styles.payoutPill}>
                    <Text style={styles.payoutPillText}>Max Payout: {formatCurrency(quote?.max_weekly_payout)}</Text>
                  </View>

                  <View style={styles.pointList}>
                    {tier.points.map((point) => (
                      <View key={point} style={styles.pointRow}>
                        <Text style={styles.pointCheck}>✓</Text>
                        <Text style={styles.pointLabel}>{point}</Text>
                      </View>
                    ))}
                  </View>

                  <PrimaryButton
                    label={`Buy ${getTierLabel(tier.id)} Plan`}
                    onPress={() => {
                      setSelectedTier(tier);
                      setSelectedPayment('UPI');
                      setSuccess(false);
                    }}
                  />
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      <BottomSheet visible={!!selectedTier} onClose={() => setSelectedTier(null)}>
        {success ? (
          <View style={styles.successSheet}>
            <View style={styles.successCircle}>
              <Text style={styles.successTick}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Plan Activated!</Text>
            <Text style={styles.successText}>Your weekly coverage is now active.</Text>
            <PrimaryButton
              label="OK"
              onPress={() => {
                setSelectedTier(null);
                setSuccess(false);
              }}
            />
          </View>
        ) : (
          <View style={styles.sheetContent}>
            <View style={styles.sheetSummary}>
              <Text style={styles.sheetPlan}>{selectedTier ? getTierLabel(selectedTier.id) : '--'}</Text>
              <Text style={styles.sheetPrice}>
                {selectedTier ? formatCurrency(getDisplayedQuotePrice(selectedTier.id, quotes[selectedTier.id])) : '--'}
              </Text>
            </View>

            <View style={styles.paymentRow}>
              {PAYMENT_METHODS.map((method) => {
                const active = method === selectedPayment;
                return (
                  <TouchableOpacity
                    key={method}
                    onPress={() => setSelectedPayment(method)}
                    style={[styles.paymentPill, active && styles.paymentPillActive]}
                  >
                    <Text style={[styles.paymentText, active && styles.paymentTextActive]}>{method}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <PrimaryButton label="Confirm Purchase" onPress={confirmPurchase} loading={purchasing} />
          </View>
        )}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  scroll: { padding: 16, paddingBottom: 32 },
  header: { alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: palette.textPrimary, textAlign: 'center' },
  subtitle: { color: palette.textMuted, fontSize: 13, textAlign: 'center', marginTop: 6 },
  headerBadges: { flexDirection: 'row', gap: 10, marginTop: 12 },
  loadingText: { textAlign: 'center', color: palette.textMuted, marginTop: 24 },
  stack: { gap: 12 },
  planCard: { gap: 12 },
  planCardFeatured: {
    borderWidth: 2,
    borderColor: palette.orange,
  },
  planTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  planName: { color: palette.textPrimary, fontSize: 20, fontWeight: '800' },
  planSubtitle: { color: palette.textMuted, fontSize: 13, marginTop: 4 },
  planPrice: { color: palette.orange, fontSize: 32, fontWeight: '800', marginTop: 6 },
  planPerWeek: { color: palette.textMuted, fontSize: 12 },
  payoutPill: {
    alignSelf: 'flex-start',
    backgroundColor: palette.bgMuted,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  payoutPillText: { color: palette.textSecondary, fontSize: 12, fontWeight: '700' },
  pointList: { gap: 8 },
  pointRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pointCheck: { color: palette.success, fontSize: 15, fontWeight: '800' },
  pointLabel: { color: palette.textSecondary, fontSize: 14 },
  sheetContent: { gap: 18, paddingBottom: 6 },
  sheetSummary: {
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: palette.bgMuted,
  },
  sheetPlan: { color: palette.textPrimary, fontSize: 18, fontWeight: '800' },
  sheetPrice: { color: palette.orange, fontSize: 22, fontWeight: '800', marginTop: 6 },
  paymentRow: { flexDirection: 'row', gap: 10 },
  paymentPill: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentPillActive: {
    backgroundColor: palette.orangeTint,
    borderColor: palette.orangeBorder,
  },
  paymentText: { color: palette.textSecondary, fontWeight: '700' },
  paymentTextActive: { color: palette.orange },
  successSheet: { alignItems: 'center', gap: 14, paddingBottom: 6 },
  successCircle: {
    width: 68,
    height: 68,
    borderRadius: radius.full,
    backgroundColor: palette.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTick: { color: palette.success, fontSize: 32, fontWeight: '800' },
  successTitle: { ...typography.displayMedium, color: palette.textPrimary },
  successText: { color: palette.textSecondary, textAlign: 'center' },
});
