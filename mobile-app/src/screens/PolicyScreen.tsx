import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { api } from '../api/client';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { palette, radius, typography } from '../theme';
import { formatCurrency, formatDate, getDisplayedPolicyPrice, getTierLabel } from '../utils/format';

export function PolicyScreen() {
  const { token } = useAuth();
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      if (!token) return;
      setLoading(true);
      try {
        setPolicy(await api.activePolicy(token));
      } catch {
        setPolicy(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchPolicy();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={palette.orange} />
        <Text style={styles.loadingText}>Loading policy details</Text>
      </View>
    );
  }

  if (!policy) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>No active policy</Text>
        <Text style={styles.emptyText}>Buy a plan to unlock disruption-triggered protection.</Text>
      </View>
    );
  }

  const covered = [
    'Heavy Rain',
    'Extreme Heat',
    'Flash Flood',
    policy.social_disruption_cover ? 'Local Curfew / Bandh' : null,
  ].filter(Boolean) as string[];

  const notCovered = ['Health / Accident', 'Vehicle Repairs', 'Manual reimbursement'];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View>
            <Badge label={`${getTierLabel(policy.tier).toUpperCase()} PLAN`} tone="orange" />
            <Text style={styles.price}>{formatCurrency(getDisplayedPolicyPrice(policy))}</Text>
            <Text style={styles.perWeek}>/ week</Text>
          </View>
          <Badge label="Active" tone="success" />
        </View>

        <View style={styles.statPills}>
          <StatPill label="Max Payout" value={formatCurrency(policy.max_weekly_payout)} />
          <StatPill label="Start" value={formatDate(policy.coverage_start)} />
          <StatPill label="End" value={formatDate(policy.coverage_end)} />
        </View>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Coverage Details</Text>
        <View style={styles.coverageColumns}>
          <View style={styles.coverageColumn}>
            <Text style={styles.columnTitle}>What&apos;s covered</Text>
            {covered.map((item) => (
              <CoverageItem key={item} label={item} covered />
            ))}
          </View>
          <View style={styles.coverageColumn}>
            <Text style={styles.columnTitle}>Not covered</Text>
            {notCovered.map((item) => (
              <CoverageItem key={item} label={item} covered={false} />
            ))}
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>How payouts work</Text>
        <View style={styles.timelineRow}>
          <TimelineStep number="01" label="Detected" />
          <TimelineLine />
          <TimelineStep number="02" label="Validated" />
          <TimelineLine />
          <TimelineStep number="03" label="Credited" />
        </View>
        <Text style={styles.timelineText}>
          Verified disruptions are detected, checked against policy rules, and then routed for
          instant payout credit.
        </Text>
      </Card>

      <Text style={styles.footerNote}>
        Coverage only. Does not include health, accident, or vehicle insurance.
      </Text>
    </ScrollView>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statPillLabel}>{label}</Text>
      <Text style={styles.statPillValue}>{value}</Text>
    </View>
  );
}

function CoverageItem({ label, covered }: { label: string; covered: boolean }) {
  return (
    <View style={styles.coverageItem}>
      <Text style={[styles.coverageIcon, { color: covered ? palette.success : palette.error }]}>
        {covered ? '✓' : '✕'}
      </Text>
      <Text style={styles.coverageLabel}>{label}</Text>
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
  scroll: { padding: 16, paddingBottom: 32, gap: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.bg, padding: 24 },
  loadingText: { marginTop: 10, color: palette.textMuted },
  emptyTitle: { color: palette.textPrimary, fontSize: 24, fontWeight: '800' },
  emptyText: { color: palette.textSecondary, textAlign: 'center', marginTop: 8 },
  heroCard: {
    backgroundColor: palette.orangeTint,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.orangeBorder,
    padding: 16,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  price: {
    color: palette.textPrimary,
    fontSize: 36,
    fontWeight: '800',
    marginTop: 14,
  },
  perWeek: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  statPills: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  statPill: {
    flex: 1,
    backgroundColor: palette.bgSurface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statPillLabel: {
    ...typography.label,
    color: palette.textMuted,
    marginBottom: 4,
  },
  statPillValue: {
    color: palette.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  coverageColumns: {
    gap: 18,
  },
  coverageColumn: {
    gap: 10,
  },
  columnTitle: {
    color: palette.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  coverageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coverageIcon: {
    fontSize: 16,
    fontWeight: '800',
  },
  coverageLabel: {
    color: palette.textPrimary,
    fontSize: 14,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineStep: {
    alignItems: 'center',
    width: 72,
  },
  timelineNumber: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: palette.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineNumberText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  timelineLabel: {
    color: palette.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  timelineLine: {
    flex: 1,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: palette.borderStrong,
    marginHorizontal: 4,
  },
  timelineText: {
    color: palette.textSecondary,
    marginTop: 14,
    lineHeight: 20,
  },
  footerNote: {
    textAlign: 'center',
    color: palette.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
  },
});
