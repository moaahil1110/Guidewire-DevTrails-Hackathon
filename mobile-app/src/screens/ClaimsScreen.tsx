import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { api } from '../api/client';
import { Badge } from '../components/Badge';
import { BottomSheet } from '../components/BottomSheet';
import { Card } from '../components/Card';
import { ClaimRow } from '../components/ClaimRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { palette, radius, typography } from '../theme';
import { formatCurrency } from '../utils/format';
import type { DisruptionType } from '../types';

const REVIEW_STORAGE_KEY = 'insureit-claim-review-state';
const REVIEW_DURATION_MS = 60_000;

const DISRUPTIONS = [
  { id: 'heavy_rain' as DisruptionType, title: 'Heavy Rain', hours: 2.5, accent: palette.orange },
  { id: 'extreme_heat' as DisruptionType, title: 'Extreme Heat', hours: 3, accent: palette.error },
  { id: 'flood' as DisruptionType, title: 'Flash Flood', hours: 6, accent: palette.info },
  { id: 'curfew' as DisruptionType, title: 'Local Curfew', hours: 5, accent: '#7C3AED' },
  { id: 'platform_downtime' as DisruptionType, title: 'Platform Down', hours: 1, accent: palette.success },
];

type ReviewEntry = {
  claimId: number;
  payoutAmount: number;
  releaseAt: number;
};

export function ClaimsScreen() {
  const { token } = useAuth();
  const [claims, setClaims] = useState<any[]>([]);
  const [reviewEntries, setReviewEntries] = useState<ReviewEntry[]>([]);
  const [pending, setPending] = useState<(typeof DISRUPTIONS)[number] | null>(null);
  const [now, setNow] = useState(Date.now());
  const [triggering, setTriggering] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      const raw = await AsyncStorage.getItem(REVIEW_STORAGE_KEY);
      if (raw) {
        try {
          setReviewEntries((JSON.parse(raw) as ReviewEntry[]).filter((entry) => entry.releaseAt > Date.now()));
        } catch {
          setReviewEntries([]);
        }
      }
      if (token) {
        try {
          setClaims(await api.claims(token));
        } catch {
          setClaims([]);
        }
      }
    };

    void bootstrap();
  }, [token]);

  useEffect(() => {
    void AsyncStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviewEntries));
  }, [reviewEntries]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setReviewEntries((current) => current.filter((entry) => entry.releaseAt > now));
  }, [now]);

  const reviewMap = useMemo(() => new Map(reviewEntries.map((entry) => [entry.claimId, entry])), [reviewEntries]);
  const amountClaimed = claims.reduce((sum, item) => sum + (item.payout_amount || 0), 0);
  const amountReview = reviewEntries.reduce((sum, item) => sum + item.payoutAmount, 0);
  const amountCredited = Math.max(amountClaimed - amountReview, 0);

  const triggerClaim = async () => {
    if (!token || !pending) return;
    setTriggering(true);
    try {
      const result = await api.simulateTrigger(token, pending.id, pending.hours);
      const claim = result.claim;
      if (claim) {
        setReviewEntries((current) => [
          {
            claimId: claim.id,
            payoutAmount: claim.payout_amount,
            releaseAt: Date.now() + REVIEW_DURATION_MS,
          },
          ...current.filter((entry) => entry.claimId !== claim.id),
        ]);
      }
      setClaims(await api.claims(token));
      setPending(null);
      setNoticeOpen(true);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
        <Card>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Claims Management</Text>
              <Text style={styles.headerSubtitle}>Monitor disruption simulations and live review windows.</Text>
            </View>
            <View style={styles.liveWrap}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>
        </Card>

        <View style={styles.metricRow}>
          <StatCard label="Under Review" value={String(reviewEntries.length)} />
          <StatCard label="Claimed" value={formatCurrency(amountClaimed)} />
          <StatCard label="Credited" value={formatCurrency(amountCredited)} />
        </View>

        <Card>
          <Text style={styles.sectionTitle}>Simulate a Disruption</Text>
          <View style={styles.simGrid}>
            {DISRUPTIONS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setPending(item)}
                style={[
                  styles.simCard,
                  { borderLeftColor: item.accent },
                  index === 4 && styles.simCardWide,
                ]}
              >
                <Text style={styles.simTitle}>{item.title}</Text>
                <Text style={styles.simHours}>{item.hours} hours blocked</Text>
                <Text style={styles.simAction}>Simulate →</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card>
          <View style={styles.statementHeader}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            <Text style={styles.statementLink}>View statement</Text>
          </View>
          {claims.length ? (
            claims.map((claim) => (
              <ClaimRow key={claim.id} claim={claim} reviewEntry={reviewMap.get(claim.id)} now={now} />
            ))
          ) : (
            <Text style={styles.emptyText}>No claim activity yet.</Text>
          )}
        </Card>
      </ScrollView>

      <BottomSheet visible={!!pending} onClose={() => setPending(null)}>
        <View style={styles.sheetSummary}>
          <Text style={styles.sheetTitle}>{pending?.title || '--'}</Text>
          <Text style={styles.sheetText}>
            {pending ? `${pending.hours} hours blocked • trigger source: react-native-demo` : '--'}
          </Text>
        </View>
        <PrimaryButton label="Generate Claim" onPress={triggerClaim} loading={triggering} />
      </BottomSheet>

      <BottomSheet visible={noticeOpen} onClose={() => setNoticeOpen(false)}>
        <View style={styles.noticeWrap}>
          <Badge label="Under Review" tone="warning" />
          <Text style={styles.noticeText}>Your claim is now under review and will be credited once verified.</Text>
          <PrimaryButton label="OK" onPress={() => setNoticeOpen(false)} />
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  scroll: { padding: 16, paddingBottom: 32, gap: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  headerTitle: { ...typography.displayMedium, color: palette.textPrimary },
  headerSubtitle: { color: palette.textSecondary, marginTop: 6, maxWidth: 240 },
  liveWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: radius.full, backgroundColor: palette.success },
  liveText: { color: palette.success, fontSize: 12, fontWeight: '700' },
  metricRow: { flexDirection: 'row', gap: 10 },
  sectionTitle: { color: palette.textPrimary, fontSize: 18, fontWeight: '800' },
  simGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 14 },
  simCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: palette.border,
    borderLeftWidth: 3,
    borderRadius: radius.lg,
    padding: 14,
    backgroundColor: palette.bgSurface,
  },
  simCardWide: { width: '100%' },
  simTitle: { color: palette.textPrimary, fontSize: 15, fontWeight: '700' },
  simHours: { color: palette.textMuted, fontSize: 11, marginTop: 8 },
  simAction: { color: palette.orange, fontSize: 12, fontWeight: '700', marginTop: 14, textAlign: 'right' },
  statementHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statementLink: { color: palette.orange, fontSize: 12, fontWeight: '700' },
  emptyText: { color: palette.textMuted, marginTop: 10 },
  sheetSummary: {
    backgroundColor: palette.bgMuted,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 16,
  },
  sheetTitle: { color: palette.textPrimary, fontSize: 18, fontWeight: '800' },
  sheetText: { color: palette.textSecondary, marginTop: 6 },
  noticeWrap: { gap: 14, alignItems: 'center' },
  noticeText: { color: palette.textSecondary, textAlign: 'center' },
});
