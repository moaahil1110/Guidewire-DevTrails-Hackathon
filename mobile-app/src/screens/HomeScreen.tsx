import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { api } from '../api/client';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { SectionHeader } from '../components/SectionHeader';
import { useAuth } from '../context/AuthContext';
import { palette, radius, typography } from '../theme';
import { formatCurrency, formatDate, getCoverageDaysRemaining, getDisplayedPolicyPrice, getDisruptionCode, getDisruptionLabel, getGreeting, getTierLabel } from '../utils/format';
import type { Claim, Policy } from '../types';

const ACTIONS = [
  { label: 'Policy', target: 'Policy', icon: 'PL' },
  { label: 'Plans', target: 'Premium', icon: 'PN' },
  { label: 'Claims', target: 'Claims', icon: 'CL' },
  { label: 'Account', target: 'Account', icon: 'AC' },
];

export function HomeScreen({ navigation }: any) {
  const { user, token } = useAuth();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    const run = async () => {
      if (!token) return;
      const [policyResult, claimsResult] = await Promise.allSettled([api.activePolicy(token), api.claims(token)]);
      setPolicy(policyResult.status === 'fulfilled' ? policyResult.value : null);
      setClaims(claimsResult.status === 'fulfilled' ? claimsResult.value.slice(0, 3) : []);
    };

    void run();
  }, [token]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <View style={styles.greeting}>
        <Text style={styles.greetingTitle}>
          {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Ravi'}
        </Text>
        <Text style={styles.greetingSubtitle}>Your income is protected</Text>
      </View>

      <View style={styles.heroStrip}>
        <View>
          <Text style={styles.heroValue}>{formatCurrency(user?.avg_daily_earnings)} earned today</Text>
          <Badge label="↑ 12% vs yesterday" tone="success" />
        </View>
        <View style={styles.heroMeta}>
          <Badge label="Low Risk" tone="success" />
          <Text style={styles.heroMetaText}>In 45 mins</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionRow}>
        {ACTIONS.map((action) => (
          <TouchableOpacity key={action.label} style={styles.actionPill} onPress={() => navigation.navigate(action.target)}>
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>{action.icon}</Text>
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Card style={styles.policyCard}>
        <View style={styles.policyAccent} />
        <View style={styles.policyBody}>
          <Text style={styles.policyTitle}>{policy ? `${getTierLabel(policy.tier)} Plan` : 'No active plan'}</Text>
          <Text style={styles.policySubtitle}>
            {policy ? `Coverage ends ${formatDate(policy.coverage_end)}` : 'Buy a plan to activate coverage'}
          </Text>
          {policy ? (
            <View style={styles.policyStats}>
              <Text style={styles.policyStat}>Max payout {formatCurrency(policy.max_weekly_payout)}</Text>
              <Text style={styles.policyStat}>Premium {formatCurrency(getDisplayedPolicyPrice(policy))}</Text>
              <Text style={styles.policyStat}>{getCoverageDaysRemaining(policy)}</Text>
            </View>
          ) : null}
          <TouchableOpacity onPress={() => navigation.navigate(policy ? 'Policy' : 'Premium')}>
            <Text style={styles.linkText}>{policy ? 'View Details →' : 'Buy a plan →'}</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card>
        <SectionHeader title="Recent Claims" actionLabel="View all claims →" onActionPress={() => navigation.navigate('Claims')} />
        <View style={styles.claimsList}>
          {claims.length ? (
            claims.map((claim) => (
              <View key={claim.id} style={styles.claimRow}>
                <View style={styles.claimCodeCircle}>
                  <Text style={styles.claimCodeText}>{getDisruptionCode(claim.disruption_type)}</Text>
                </View>
                <View style={styles.claimCenter}>
                  <Text style={styles.claimType}>{getDisruptionLabel(claim.disruption_type)}</Text>
                  <Text style={styles.claimMeta}>{formatDate(claim.created_at)}</Text>
                </View>
                <View style={styles.claimRight}>
                  <Text style={styles.claimAmount}>{formatCurrency(claim.payout_amount)}</Text>
                  <Badge label={claim.status === 'paid' ? 'Credited' : claim.status} tone={claim.status === 'paid' ? 'success' : 'warning'} />
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No claims yet. Simulate a disruption to populate this list.</Text>
          )}
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  scroll: { padding: 16, paddingTop: 20, paddingBottom: 32, gap: 16 },
  greeting: {
    gap: 4,
  },
  greetingTitle: {
    ...typography.displayMedium,
    color: palette.textPrimary,
  },
  greetingSubtitle: {
    color: palette.textMuted,
    fontSize: 14,
  },
  heroStrip: {
    marginTop: 16,
    borderRadius: radius.xl,
    backgroundColor: palette.orangeTint,
    borderWidth: 1,
    borderColor: palette.orangeBorder,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroValue: {
    color: palette.orange,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
  },
  heroMeta: {
    alignItems: 'flex-end',
    gap: 10,
  },
  heroMetaText: {
    color: palette.textMuted,
    fontSize: 12,
  },
  actionRow: {
    gap: 10,
    paddingVertical: 16,
  },
  actionPill: {
    minWidth: 84,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: palette.bgSurface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: palette.bgSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconText: {
    color: palette.orange,
    fontSize: 11,
    fontWeight: '800',
  },
  actionLabel: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  policyCard: {
    flexDirection: 'row',
    padding: 0,
    overflow: 'hidden',
  },
  policyAccent: {
    width: 4,
    backgroundColor: palette.orange,
  },
  policyBody: {
    flex: 1,
    padding: 16,
  },
  policyTitle: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  policySubtitle: {
    color: palette.textMuted,
    marginTop: 4,
  },
  policyStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  policyStat: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  linkText: {
    marginTop: 12,
    color: palette.orange,
    fontSize: 13,
    fontWeight: '700',
  },
  claimsList: {
    marginTop: 14,
  },
  claimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  claimCodeCircle: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: palette.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimCodeText: {
    color: palette.orange,
    fontSize: 11,
    fontWeight: '800',
  },
  claimCenter: {
    flex: 1,
  },
  claimType: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  claimMeta: {
    color: palette.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  claimRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  claimAmount: {
    color: palette.textPrimary,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 12,
    color: palette.textMuted,
    fontSize: 13,
  },
});
