import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { palette, radius, shadows } from '../theme';

function getDisplayedPolicyPrice(tier?: string, premium?: number) {
  if (tier === 'basic') {
    return 29;
  }
  return premium ? Number(premium.toFixed(0)) : null;
}

export function PolicyScreen({ navigation }: any) {
  const { token } = useAuth();
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const result = await api.activePolicy(token);
      setPolicy(result);
    } catch {
      setPolicy(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={palette.orange} size="large" />
        <Text style={styles.loadingText}>Loading active policy</Text>
      </View>
    );
  }

  if (!policy) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>No active policy</Text>
        <Text style={styles.emptyText}>Buy a plan first to unlock disruption-triggered claims and payout automation.</Text>
        <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('Premium')}>
          <Text style={styles.emptyButtonText}>Browse Plans</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const start = new Date(policy.coverage_start).toLocaleDateString();
  const end = new Date(policy.coverage_end).toLocaleDateString();
  const displayedPrice = getDisplayedPolicyPrice(policy.tier, policy.weekly_premium);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <View style={styles.headerPanel}>
        <Text style={styles.brand}>InsureIt</Text>
        <Text style={styles.title}>My Policy</Text>
        <Text style={styles.subtitle}>Active protection for this coverage week</Text>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.planName}>{policy.tier.toUpperCase()} PLAN</Text>
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          </View>
          <View style={styles.priceBlock}>
            <Text style={styles.priceValue}>Rs {displayedPrice ?? '--'}</Text>
            <Text style={styles.priceMeta}>weekly premium</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <SummaryStat label="Max payout" value={`Rs ${policy.max_weekly_payout}`} />
          <SummaryStat label="Start" value={start} />
          <SummaryStat label="End" value={end} />
        </View>
      </View>

      <View style={styles.dualSection}>
        <View style={styles.coverageCard}>
          <Text style={styles.sectionTitle}>What's covered</Text>
          <CoverageRow label="Heavy Rain" active />
          <CoverageRow label="Extreme Heat" active />
          <CoverageRow label="Flash Flood" active />
          <CoverageRow label="Local Curfew / Bandh" active={policy.social_disruption_cover} />
        </View>

        <View style={styles.coverageCard}>
          <Text style={styles.sectionTitle}>Not covered</Text>
          <CoverageRow label="Health / Accident" active={false} />
          <CoverageRow label="Vehicle Repairs" active={false} />
          <CoverageRow label="Manual reimbursement" active={false} />
          <CoverageRow label="Offline cash claims" active={false} />
        </View>
      </View>

      <View style={styles.processCard}>
        <Text style={styles.sectionTitle}>How payouts work</Text>
        <Text style={styles.processText}>
          When your zone crosses a configured trigger, the system auto-detects the disruption, validates it, and credits the payout against your active policy.
        </Text>
        <View style={styles.timelineRow}>
          <TimelineStep number="01" label="Disruption detected" />
          <TimelineLine />
          <TimelineStep number="02" label="AI validates" />
          <TimelineLine />
          <TimelineStep number="03" label="UPI credited" />
        </View>
      </View>
    </ScrollView>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function CoverageRow({ label, active }: { label: string; active: boolean }) {
  return (
    <View style={styles.coverageRow}>
      <Text style={styles.coverageLabel}>{label}</Text>
      <View style={[styles.coverageChip, active ? styles.coverageChipOn : styles.coverageChipOff]}>
        <Text style={[styles.coverageChipText, active ? styles.coverageChipTextOn : styles.coverageChipTextOff]}>
          {active ? 'Included' : 'Excluded'}
        </Text>
      </View>
    </View>
  );
}

function TimelineStep({ number, label }: { number: string; label: string }) {
  return (
    <View style={styles.timelineStep}>
      <View style={styles.timelineNumber}>
        <Text style={styles.timelineNumberText}>{number}</Text>
      </View>
      <Text style={styles.timelineLabel}>{label}</Text>
    </View>
  );
}

function TimelineLine() {
  return <View style={styles.timelineLine} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  centered: {
    flex: 1,
    backgroundColor: palette.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: { color: palette.textSecondary, marginTop: 12 },
  emptyTitle: { color: palette.textPrimary, fontSize: 24, fontWeight: '800' },
  emptyText: { color: palette.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  emptyButton: {
    marginTop: 18,
    backgroundColor: palette.orange,
    borderRadius: radius.md,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  emptyButtonText: { color: '#fff', fontWeight: '800' },
  headerPanel: {
    backgroundColor: palette.bgSoft,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 18,
    ...shadows.card,
  },
  brand: {
    color: palette.orangeSoft,
    fontWeight: '800',
    fontSize: 16,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 30,
    fontWeight: '800',
    marginTop: 10,
  },
  subtitle: {
    color: palette.textSecondary,
    marginTop: 4,
  },
  heroCard: {
    backgroundColor: palette.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.orangeBorder,
    padding: 20,
    marginTop: 16,
    ...shadows.card,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  planName: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: palette.successDim,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
    gap: 6,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: palette.success,
  },
  activeBadgeText: {
    color: palette.success,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  priceValue: {
    color: palette.orangeLight,
    fontSize: 30,
    fontWeight: '800',
  },
  priceMeta: {
    color: palette.textMuted,
    marginTop: 4,
    fontSize: 11,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  summaryStat: {
    flex: 1,
    backgroundColor: palette.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
  },
  summaryLabel: {
    color: palette.textMuted,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  summaryValue: {
    color: palette.textPrimary,
    fontWeight: '800',
    marginTop: 8,
  },
  dualSection: {
    gap: 14,
    marginTop: 16,
  },
  coverageCard: {
    backgroundColor: palette.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
  },
  sectionTitle: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  coverageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.borderLight,
  },
  coverageLabel: {
    color: palette.textSecondary,
    flex: 1,
  },
  coverageChip: {
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  coverageChipOn: {
    backgroundColor: palette.successDim,
  },
  coverageChipOff: {
    backgroundColor: palette.errorDim,
  },
  coverageChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  coverageChipTextOn: {
    color: palette.success,
  },
  coverageChipTextOff: {
    color: palette.error,
  },
  processCard: {
    backgroundColor: palette.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 18,
    marginTop: 16,
  },
  processText: {
    color: palette.textSecondary,
    lineHeight: 20,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  timelineStep: {
    alignItems: 'center',
    flex: 1,
  },
  timelineNumber: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: palette.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineNumberText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
  },
  timelineLabel: {
    color: palette.textSecondary,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 10,
  },
  timelineLine: {
    height: 2,
    flex: 0.45,
    backgroundColor: palette.orangeBorder,
    marginBottom: 22,
  },
});
