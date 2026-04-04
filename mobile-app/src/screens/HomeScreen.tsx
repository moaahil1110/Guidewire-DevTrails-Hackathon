import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { palette, radius, shadows } from '../theme';

export function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const firstName = user?.full_name?.split(' ')[0] || 'Rider';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const quickCards = [
    {
      title: 'Policy Details',
      subtitle: 'Review your active cover and blocked-hour limits.',
      screen: 'Policy',
      accent: palette.orange,
    },
    {
      title: 'Upgrade Plan',
      subtitle: 'Switch your tier before the next payout cycle.',
      screen: 'Premium',
      accent: palette.blue,
    },
    {
      title: 'Fast Claims',
      subtitle: 'Trigger the simulator and preview instant payouts.',
      screen: 'Claims',
      accent: palette.violet,
    },
    {
      title: 'Account',
      subtitle: 'Keep rider details and zone information current.',
      screen: 'Account',
      accent: palette.success,
    },
  ];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <View style={styles.shell}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>InsureIt</Text>
            <Text style={styles.navMeta}>Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.signOutButton} onPress={logout}>
            <Text style={styles.signOutButtonText}>Sign out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroPanel}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>Coverage Active</Text>
            <Text style={styles.heroTitle}>
              {greeting}, {firstName}
            </Text>
            <Text style={styles.heroSubtitle}>
              Your income protection is live. Watch active coverage, price updates, and claim triggers from one place.
            </Text>
          </View>

          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeLabel}>Current zone</Text>
            <Text style={styles.heroBadgeValue}>{user?.zone || 'Unknown zone'}</Text>
            <Text style={styles.heroBadgeMeta}>{user?.city || 'Bengaluru'}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Daily earnings" value={`Rs ${user?.avg_daily_earnings ?? '--'}`} accent={palette.orange} />
          <StatCard label="Platform" value={user?.platform || '--'} accent={palette.blue} />
          <StatCard label="Risk score" value={String(user?.risk_score ?? '--')} accent={palette.success} />
          <StatCard label="Coverage window" value="7 days" accent={palette.violet} />
        </View>

        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <Text style={styles.sectionTitle}>Active route</Text>
            <Text style={styles.mapMeta}>Live mobile view</Text>
          </View>
          <View style={styles.mapCanvas}>
            <View style={styles.routeDot} />
            <View style={styles.routeLine} />
            <View style={[styles.routeDot, { top: 74, left: '58%' }]} />
            <View style={[styles.routeLine, { top: 92, left: '45%', width: '30%', transform: [{ rotate: '-18deg' }] }]} />
            <View style={[styles.routeDot, { top: 132, left: '72%' }]} />
          </View>
          <View style={styles.mapFooterPill}>
            <Text style={styles.mapFooterLabel}>Estimated claim readiness in 90 sec during a disruption</Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Operational Controls</Text>
        <View style={styles.controlsGrid}>
          {quickCards.map((card) => (
            <TouchableOpacity key={card.title} style={styles.controlCard} onPress={() => navigation.navigate(card.screen)}>
              <View style={[styles.controlAccent, { backgroundColor: card.accent }]} />
              <Text style={styles.controlTitle}>{card.title}</Text>
              <Text style={styles.controlText}>{card.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statAccent, { backgroundColor: accent }]} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  scroll: {
    padding: 16,
    paddingBottom: 36,
  },
  shell: {
    backgroundColor: palette.bgSoft,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    ...shadows.card,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  brand: {
    color: palette.orangeSoft,
    fontSize: 18,
    fontWeight: '800',
  },
  navMeta: {
    color: palette.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  signOutButton: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: palette.bgGlass,
  },
  signOutButtonText: {
    color: palette.textSecondary,
    fontWeight: '700',
    fontSize: 12,
  },
  heroPanel: {
    backgroundColor: palette.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 18,
    flexDirection: 'row',
    gap: 14,
  },
  heroCopy: {
    flex: 1,
  },
  heroKicker: {
    alignSelf: 'flex-start',
    backgroundColor: palette.successDim,
    color: palette.success,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    overflow: 'hidden',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  heroTitle: {
    color: palette.textPrimary,
    fontSize: 30,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: palette.textSecondary,
    lineHeight: 21,
    marginTop: 8,
  },
  heroBadge: {
    width: 116,
    backgroundColor: palette.blueDim,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#164e63',
    padding: 12,
    justifyContent: 'center',
  },
  heroBadgeLabel: {
    color: palette.blue,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    fontWeight: '700',
  },
  heroBadgeValue: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 10,
  },
  heroBadgeMeta: {
    color: palette.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  statCard: {
    width: '48%',
    backgroundColor: palette.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 14,
  },
  statAccent: {
    width: 24,
    height: 4,
    borderRadius: radius.full,
    marginBottom: 10,
  },
  statLabel: {
    color: palette.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statValue: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
  },
  mapCard: {
    backgroundColor: palette.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    marginTop: 14,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  mapMeta: {
    color: palette.textMuted,
    fontSize: 12,
  },
  mapCanvas: {
    height: 180,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#20242c',
    borderWidth: 1,
    borderColor: palette.border,
    position: 'relative',
  },
  routeDot: {
    position: 'absolute',
    top: 30,
    left: '34%',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.orange,
    borderWidth: 3,
    borderColor: '#fff',
  },
  routeLine: {
    position: 'absolute',
    top: 46,
    left: '37%',
    width: '24%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
    transform: [{ rotate: '26deg' }],
  },
  mapFooterPill: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: palette.bgElevated,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mapFooterLabel: {
    color: palette.textSecondary,
    fontSize: 11,
  },
  sectionHeading: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 12,
  },
  controlsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  controlCard: {
    width: '48%',
    backgroundColor: palette.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
  },
  controlAccent: {
    width: 36,
    height: 6,
    borderRadius: radius.full,
    marginBottom: 12,
  },
  controlTitle: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  controlText: {
    color: palette.textSecondary,
    lineHeight: 19,
    marginTop: 6,
    fontSize: 12,
  },
});
