import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { DisruptionType } from '../types';
import { palette, radius, shadows } from '../theme';

const DISRUPTIONS = [
  { id: 'heavy_rain' as DisruptionType, label: 'Heavy Rain', detail: 'Parametric rainfall trigger for intense urban downpours.', hours: 2.5, accent: palette.orange },
  { id: 'extreme_heat' as DisruptionType, label: 'Extreme Heat', detail: 'Protection for outdoor work pauses during heat alerts.', hours: 3, accent: '#f87171' },
  { id: 'flood' as DisruptionType, label: 'Flash Flood', detail: 'Emergency cover for blocked routes and civic shutdowns.', hours: 6, accent: palette.blue },
  { id: 'curfew' as DisruptionType, label: 'Local Curfew', detail: 'Social disruption scenario with restricted movement.', hours: 5, accent: palette.violet },
  { id: 'platform_downtime' as DisruptionType, label: 'Platform Down', detail: 'Commercial downtime on registered gig platforms.', hours: 1, accent: palette.success },
];

const REVIEW_DURATION_MS = 60 * 1000;
const REVIEW_STORAGE_KEY = 'insureit-claim-review-state';

type ReviewEntry = {
  claimId: number;
  payoutAmount: number;
  releaseAt: number;
};

export function ClaimsScreen() {
  const { token } = useAuth();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [pending, setPending] = useState<(typeof DISRUPTIONS)[number] | null>(null);
  const [reviewEntries, setReviewEntries] = useState<ReviewEntry[]>([]);
  const [showSubmittedModal, setShowSubmittedModal] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    loadReviewEntries();
    fetchClaims();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!reviewEntries.length) {
      return;
    }

    const activeEntries = reviewEntries.filter((entry) => entry.releaseAt > now);
    if (activeEntries.length !== reviewEntries.length) {
      setReviewEntries(activeEntries);
      persistReviewEntries(activeEntries);
    }
  }, [now, reviewEntries]);

  const reviewMap = useMemo(() => {
    return new Map(reviewEntries.map((entry) => [entry.claimId, entry]));
  }, [reviewEntries]);

  const claimedAmount = claims.reduce((sum, claim) => sum + (claim.payout_amount || 0), 0);
  const amountInReview = reviewEntries.reduce((sum, entry) => sum + entry.payoutAmount, 0);
  const creditedAmount = Math.max(claimedAmount - amountInReview, 0);

  const loadReviewEntries = async () => {
    try {
      const raw = await AsyncStorage.getItem(REVIEW_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const storedEntries = JSON.parse(raw) as ReviewEntry[];
      const activeEntries = storedEntries.filter((entry) => entry.releaseAt > Date.now());
      setReviewEntries(activeEntries);
      await persistReviewEntries(activeEntries);
    } catch {
      setReviewEntries([]);
    }
  };

  const persistReviewEntries = async (entries: ReviewEntry[]) => {
    try {
      await AsyncStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Ignore storage errors so the UI still works in-memory.
    }
  };

  const fetchClaims = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const result = await api.claims(token);
      setClaims(result);
    } catch {
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const confirmTrigger = async () => {
    if (!token || !pending) return;
    const disruption = pending;
    setPending(null);
    setTriggering(disruption.id);

    try {
      const result = await api.simulateTrigger(token, disruption.id, disruption.hours);
      const nextClaim = result.claim;

      if (nextClaim) {
        const nextEntries = [
          {
            claimId: nextClaim.id,
            payoutAmount: nextClaim.payout_amount || 0,
            releaseAt: Date.now() + REVIEW_DURATION_MS,
          },
          ...reviewEntries.filter((entry) => entry.claimId !== nextClaim.id),
        ];
        setReviewEntries(nextEntries);
        await persistReviewEntries(nextEntries);
      }

      await fetchClaims();
      setShowSubmittedModal(true);
    } catch {
      Alert.alert('Simulation failed', 'Please make sure you have an active policy before running a disruption trigger.');
    } finally {
      setTriggering(null);
    }
  };

  return (
    <>
      <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
        <View style={styles.headerPanel}>
          <View style={styles.headerCopy}>
            <Text style={styles.brand}>InsureIt</Text>
            <Text style={styles.title}>Claims Management</Text>
            <Text style={styles.subtitle}>Monitor disruption simulations and instant compensation outcomes.</Text>
          </View>

          <View style={styles.badgeColumn}>
            <MetricBadge label="Claims in review" value={String(reviewEntries.length)} tone="review" />
            <MetricBadge label="Amount claimed" value={`Rs ${claimedAmount.toFixed(0)}`} tone="claimed" />
            <MetricBadge label="Credited amount" value={`Rs ${creditedAmount.toFixed(0)}`} tone="credited" />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Disruption Simulator</Text>
          <View style={styles.grid}>
            {DISRUPTIONS.map((item) => (
              <TouchableOpacity key={item.id} style={styles.simCard} onPress={() => setPending(item)} disabled={!!triggering}>
                <View style={[styles.simAccent, { backgroundColor: item.accent }]} />
                <Text style={styles.simTitle}>{item.label}</Text>
                <Text style={styles.simText}>{item.detail}</Text>
                <View style={styles.simFooter}>
                  <Text style={styles.simHours}>{item.hours} hours</Text>
                  <Text style={styles.simAction}>{triggering === item.id ? 'Running...' : 'Simulate now'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            <Text style={styles.historyMeta}>Live regional feed</Text>
          </View>

          {loading ? (
            <ActivityIndicator color={palette.orange} style={{ marginTop: 18 }} />
          ) : claims.length === 0 ? (
            <Text style={styles.emptyHistory}>No claims yet. Run a disruption simulation to populate this list.</Text>
          ) : (
            claims.map((claim) => (
              <HistoryRow key={claim.id} claim={claim} reviewEntry={reviewMap.get(claim.id)} now={now} />
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={!!pending} transparent animationType="slide" onRequestClose={() => setPending(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Confirm Trigger</Text>
            <Text style={styles.modalSubtitle}>
              Simulate a verified disruption event and generate an automatic claim against the active policy.
            </Text>

            <View style={styles.modalSummary}>
              <ModalRow label="Scenario" value={pending?.label || '--'} />
              <ModalRow label="Blocked hours" value={pending ? `${pending.hours}` : '--'} />
              <ModalRow label="Source" value="Automated demo flow" />
            </View>

            <TouchableOpacity style={styles.modalPrimaryButton} onPress={confirmTrigger}>
              <Text style={styles.modalPrimaryButtonText}>Generate Claim</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSecondaryButton} onPress={() => setPending(null)}>
              <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showSubmittedModal} transparent animationType="fade" onRequestClose={() => setShowSubmittedModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.noticeSheet}>
            <Text style={styles.noticeTitle}>Claim Under Review</Text>
            <Text style={styles.noticeText}>
              Hey Rider, your claim is currently under review and will be credited once it is verified. Kindly wait, and thank you for your cooperation.
            </Text>
            <TouchableOpacity style={styles.noticeButton} onPress={() => setShowSubmittedModal(false)}>
              <Text style={styles.noticeButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

function MetricBadge({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'review' | 'claimed' | 'credited';
}) {
  const toneStyles =
    tone === 'review'
      ? styles.metricReview
      : tone === 'claimed'
        ? styles.metricClaimed
        : styles.metricCredited;

  return (
    <View style={[styles.metricBadge, toneStyles]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function ModalRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.modalRow}>
      <Text style={styles.modalRowLabel}>{label}</Text>
      <Text style={styles.modalRowValue}>{value}</Text>
    </View>
  );
}

function HistoryRow({
  claim,
  reviewEntry,
  now,
}: {
  claim: any;
  reviewEntry?: ReviewEntry;
  now: number;
}) {
  const isUnderReview = !!reviewEntry && reviewEntry.releaseAt > now;
  const secondsLeft = reviewEntry ? Math.max(Math.ceil((reviewEntry.releaseAt - now) / 1000), 0) : 0;

  return (
    <View style={styles.historyRow}>
      <View style={[styles.historyIcon, { backgroundColor: isUnderReview ? palette.warningDim : palette.successDim }]}>
        <Text style={[styles.historyIconText, { color: isUnderReview ? palette.warning : palette.success }]}>
          {isUnderReview ? 'RV' : 'CR'}
        </Text>
      </View>
      <View style={styles.historyBody}>
        <Text style={styles.historyType}>{String(claim.disruption_type).replace(/_/g, ' ')}</Text>
        <Text style={styles.historyDate}>{new Date(claim.created_at).toLocaleString()}</Text>
        <Text style={styles.historyRef}>{claim.payout_reference || `Claim ${claim.id}`}</Text>
      </View>
      <View style={styles.historyRight}>
        <Text style={[styles.historyAmount, { color: isUnderReview ? palette.warning : palette.blue }]}>
          {isUnderReview ? `Rs ${claim.payout_amount?.toFixed(0)}` : `Rs ${claim.payout_amount?.toFixed(0)}`}
        </Text>
        <Text style={[styles.historyStatus, { color: isUnderReview ? palette.warning : palette.success }]}>
          {isUnderReview ? `verification in ${secondsLeft}s` : 'credited'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  headerPanel: {
    backgroundColor: palette.bgSoft,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 18,
    flexDirection: 'row',
    gap: 14,
    ...shadows.card,
  },
  headerCopy: {
    flex: 1,
  },
  brand: { color: palette.orangeSoft, fontWeight: '800' },
  title: { color: palette.textPrimary, fontSize: 30, fontWeight: '800', marginTop: 10 },
  subtitle: { color: palette.textSecondary, marginTop: 6, lineHeight: 20 },
  badgeColumn: {
    width: 128,
    gap: 10,
  },
  metricBadge: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 12,
  },
  metricReview: {
    backgroundColor: palette.warningDim,
    borderColor: '#7c5a11',
  },
  metricClaimed: {
    backgroundColor: palette.violetDim,
    borderColor: '#4c357d',
  },
  metricCredited: {
    backgroundColor: palette.blueDim,
    borderColor: '#164e63',
  },
  metricLabel: {
    color: palette.textSecondary,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    fontWeight: '700',
  },
  metricValue: {
    color: palette.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
  },
  sectionCard: {
    backgroundColor: palette.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: { color: palette.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  grid: { gap: 12 },
  simCard: {
    backgroundColor: palette.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 15,
  },
  simAccent: { width: 44, height: 5, borderRadius: radius.full, marginBottom: 12 },
  simTitle: { color: palette.textPrimary, fontSize: 17, fontWeight: '800' },
  simText: { color: palette.textSecondary, lineHeight: 19, marginTop: 6 },
  simFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  simHours: { color: palette.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
  simAction: { color: palette.orangeLight, fontSize: 12, fontWeight: '700' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyMeta: { color: palette.textMuted, fontSize: 12 },
  emptyHistory: { color: palette.textSecondary, lineHeight: 19, marginTop: 4 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.borderLight,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyIconText: {
    fontWeight: '800',
    fontSize: 11,
  },
  historyBody: { flex: 1, marginLeft: 12 },
  historyType: { color: palette.textPrimary, fontWeight: '700', textTransform: 'capitalize' },
  historyDate: { color: palette.textMuted, fontSize: 11, marginTop: 4 },
  historyRef: { color: palette.textMuted, fontSize: 11, marginTop: 3 },
  historyRight: { alignItems: 'flex-end' },
  historyAmount: { fontSize: 18, fontWeight: '800' },
  historyStatus: { marginTop: 4, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.72)' },
  modalSheet: {
    backgroundColor: palette.bgCard,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 22,
    paddingBottom: 30,
  },
  modalHandle: { width: 42, height: 4, backgroundColor: palette.borderStrong, alignSelf: 'center', borderRadius: 2, marginBottom: 14 },
  modalTitle: { color: palette.textPrimary, fontSize: 24, fontWeight: '800' },
  modalSubtitle: { color: palette.textSecondary, lineHeight: 19, marginTop: 6 },
  modalSummary: {
    marginTop: 16,
    backgroundColor: palette.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 14,
    gap: 12,
  },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  modalRowLabel: { color: palette.textSecondary },
  modalRowValue: { color: palette.textPrimary, fontWeight: '700' },
  modalPrimaryButton: { marginTop: 18, backgroundColor: palette.orange, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center' },
  modalPrimaryButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  modalSecondaryButton: { marginTop: 10, alignItems: 'center', paddingVertical: 12 },
  modalSecondaryButtonText: { color: palette.textSecondary, fontWeight: '700' },
  noticeSheet: {
    marginHorizontal: 24,
    marginBottom: 120,
    backgroundColor: palette.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 22,
    ...shadows.card,
  },
  noticeTitle: {
    color: palette.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  noticeText: {
    color: palette.textSecondary,
    lineHeight: 22,
    marginTop: 12,
  },
  noticeButton: {
    marginTop: 18,
    backgroundColor: palette.orange,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  noticeButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
