import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CoverageTier } from '../types';
import { palette, radius, shadows } from '../theme';

const TIERS = [
  {
    id: 'basic' as CoverageTier,
    name: 'Basic',
    subtitle: 'Weather-first protection for lighter risk zones.',
    accent: '#60A5FA',
    bg: '#111a27',
    border: '#1f3551',
    points: ['Rain protection', 'Heat advisory cover', 'Fast digital claims'],
  },
  {
    id: 'shield' as CoverageTier,
    name: 'Shield',
    subtitle: 'Balanced cover for riders working through variable urban conditions.',
    accent: palette.orange,
    bg: '#24170d',
    border: palette.orangeBorder,
    featured: true,
    points: ['Includes social disruption cover', 'Priority claim processing', 'Recommended for weekly riders'],
  },
  {
    id: 'max' as CoverageTier,
    name: 'Max',
    subtitle: 'Stronger limits for high-risk routes and extended work windows.',
    accent: '#A78BFA',
    bg: '#181329',
    border: '#403168',
    points: ['Platform downtime included', 'Extended hours cover', 'Highest payout ceiling'],
  },
];

const PAYMENT_METHODS = ['UPI', 'Card', 'Wallet'];

function getDisplayedPlanPrice(tierId: CoverageTier, premium?: number) {
  if (tierId === 'basic') {
    return 29;
  }
  return premium ? Number(premium.toFixed(0)) : null;
}

export function PremiumScreen() {
  const { token, user } = useAuth();
  const [quotes, setQuotes] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<(typeof TIERS)[number] | null>(null);
  const [selectedPayment, setSelectedPayment] = useState('UPI');
  const successScale = useRef(new Animated.Value(0.7)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    if (!showSuccessModal) {
      successScale.setValue(0.7);
      successOpacity.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.spring(successScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 120,
      }),
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
  }, [showSuccessModal, successOpacity, successScale]);

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

  const openPurchase = (tier: (typeof TIERS)[number]) => {
    setSelectedTier(tier);
    setSelectedPayment('UPI');
    setShowModal(true);
  };

  const confirmPurchase = async () => {
    if (!token || !selectedTier) return;
    setShowModal(false);
    setPurchasing(selectedTier.id);
    try {
      await api.purchasePolicy(token, selectedTier.id);
      setShowSuccessModal(true);
    } catch {
      setShowSuccessModal(false);
      Alert.alert('Purchase failed', 'Could not activate this plan right now.');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <>
      <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
        <View style={styles.headerPanel}>
          <Text style={styles.headerTitle}>Choose Your Plan</Text>
          <Text style={styles.headerSubtitle}>
            Transparent weekly pricing tailored to your zone profile and disruption risk.
          </Text>
          <View style={styles.headerChips}>
            <Chip label={`${user?.zone || 'Zone'}, ${user?.city || 'City'}`} />
            <Chip label={`Risk score ${user?.risk_score ?? '--'}`} tone="warning" />
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={palette.orange} size="large" />
            <Text style={styles.loadingText}>Loading quote options</Text>
          </View>
        ) : (
          <View style={styles.tierStack}>
            {TIERS.map((tier) => {
              const quote = quotes[tier.id];
              const displayedPrice = getDisplayedPlanPrice(tier.id, quote?.premium);
              return (
                <View key={tier.id} style={[styles.planCard, { backgroundColor: tier.bg, borderColor: tier.border }, tier.featured && styles.featuredCard]}>
                  {tier.featured ? <Text style={styles.featuredPill}>Most Popular</Text> : null}
                  <Text style={styles.planName}>{tier.name}</Text>
                  <Text style={styles.planSubtitle}>{tier.subtitle}</Text>
                  <Text style={[styles.planPrice, { color: tier.accent }]}>Rs {displayedPrice ?? '--'}</Text>
                  <Text style={styles.planPriceMeta}>per week</Text>

                  <View style={styles.planMetaRow}>
                    <MetricBlock label="Max payout" value={`Rs ${quote?.max_weekly_payout ?? '--'}`} />
                    <MetricBlock label="Forecast" value={`${quote?.forecast_risk_multiplier ?? '--'}x`} />
                  </View>

                  <View style={styles.pointList}>
                    {tier.points.map((point) => (
                      <View key={point} style={styles.pointRow}>
                        <View style={[styles.pointDot, { backgroundColor: tier.accent }]} />
                        <Text style={styles.pointText}>{point}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity style={[styles.buyButton, { borderColor: tier.accent }, tier.featured && styles.buyButtonFeatured]} onPress={() => openPurchase(tier)} disabled={purchasing === tier.id}>
                    {purchasing === tier.id ? <ActivityIndicator color={tier.accent} /> : <Text style={[styles.buyButtonText, { color: tier.featured ? '#fff' : tier.accent }]}>Buy {tier.name}</Text>}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Complete Payment</Text>
            <Text style={styles.modalSubtitle}>Confirm your plan and preferred payment method.</Text>

            <View style={styles.modalSummary}>
              <Text style={styles.modalSummaryLabel}>Selected plan</Text>
              <Text style={styles.modalSummaryValue}>{selectedTier?.name ?? '--'}</Text>
              <Text style={styles.modalSummaryAmount}>
                Rs {selectedTier ? getDisplayedPlanPrice(selectedTier.id, quotes[selectedTier.id]?.premium) ?? '--' : '--'}
              </Text>
            </View>

            <Text style={styles.modalSectionLabel}>Payment method</Text>
            <View style={styles.paymentRow}>
              {PAYMENT_METHODS.map((method) => {
                const active = selectedPayment === method;
                return (
                  <TouchableOpacity key={method} style={[styles.paymentChip, active && styles.paymentChipActive]} onPress={() => setSelectedPayment(method)}>
                    <Text style={[styles.paymentChipText, active && styles.paymentChipTextActive]}>{method}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.modalPrimaryButton} onPress={confirmPurchase}>
              <Text style={styles.modalPrimaryButtonText}>Confirm Purchase</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSecondaryButton} onPress={() => setShowModal(false)}>
              <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showSuccessModal} transparent animationType="fade" onRequestClose={() => setShowSuccessModal(false)}>
        <View style={styles.successOverlay}>
          <View style={styles.successSheet}>
            <Animated.View
              style={[
                styles.successIconWrap,
                {
                  opacity: successOpacity,
                  transform: [{ scale: successScale }],
                },
              ]}
            >
              <View style={styles.successIconOuter}>
                <View style={styles.successIconInner}>
                  <Text style={styles.successTick}>✓</Text>
                </View>
              </View>
            </Animated.View>
            <Text style={styles.successTitle}>Payment Confirmed</Text>
            <Text style={styles.successText}>Your plan has been activated.</Text>
            <Text style={styles.successSubText}>
              A payment portal has been sent to your registered Email ID and is to be completed before the expiration of your current plan.
            </Text>
            <TouchableOpacity style={styles.successButton} onPress={() => setShowSuccessModal(false)}>
              <Text style={styles.successButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

function Chip({ label, tone = 'default' }: { label: string; tone?: 'default' | 'warning' }) {
  return (
    <View style={[styles.chip, tone === 'warning' && styles.chipWarning]}>
      <Text style={[styles.chipText, tone === 'warning' && styles.chipTextWarning]}>{label}</Text>
    </View>
  );
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricBlock}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
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
    paddingBottom: 40,
  },
  headerPanel: {
    backgroundColor: palette.bgSoft,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 20,
    ...shadows.card,
  },
  headerTitle: {
    color: palette.textPrimary,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: palette.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  headerChips: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: palette.bgCard,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipWarning: {
    backgroundColor: palette.errorDim,
    borderColor: '#5b1f1f',
  },
  chipText: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextWarning: {
    color: '#fca5a5',
  },
  loadingBox: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 14,
  },
  loadingText: {
    color: palette.textSecondary,
  },
  tierStack: {
    gap: 16,
    marginTop: 16,
  },
  planCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 20,
    ...shadows.card,
  },
  featuredCard: {
    borderWidth: 2,
  },
  featuredPill: {
    alignSelf: 'center',
    backgroundColor: palette.orange,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    overflow: 'hidden',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  planName: {
    color: palette.textPrimary,
    fontSize: 26,
    fontWeight: '800',
  },
  planSubtitle: {
    color: palette.textSecondary,
    marginTop: 8,
    lineHeight: 20,
  },
  planPrice: {
    fontSize: 34,
    fontWeight: '800',
    marginTop: 18,
  },
  planPriceMeta: {
    color: palette.textMuted,
    marginTop: 2,
  },
  planMetaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  metricBlock: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 12,
  },
  metricLabel: {
    color: palette.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  metricValue: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 7,
  },
  pointList: {
    marginTop: 18,
    gap: 10,
  },
  pointRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  pointDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pointText: {
    color: palette.textSecondary,
    flex: 1,
    lineHeight: 19,
  },
  buyButton: {
    marginTop: 20,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  buyButtonFeatured: {
    backgroundColor: palette.orange,
  },
  buyButtonText: {
    fontWeight: '800',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  modalSheet: {
    backgroundColor: palette.bgCard,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 22,
    paddingBottom: 32,
  },
  modalHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.borderStrong,
    alignSelf: 'center',
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
  },
  modalSummary: {
    marginTop: 16,
    backgroundColor: palette.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
  },
  modalSummaryLabel: {
    color: palette.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  modalSummaryValue: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  modalSummaryAmount: {
    color: palette.orangeLight,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 10,
  },
  modalSectionLabel: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  paymentChip: {
    flex: 1,
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  paymentChipActive: {
    backgroundColor: palette.orangeDim,
    borderColor: palette.orangeBorder,
  },
  paymentChipText: {
    color: palette.textSecondary,
    fontWeight: '700',
  },
  paymentChipTextActive: {
    color: palette.orangeLight,
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
  successOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.72)',
    padding: 24,
  },
  successSheet: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: palette.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.orangeBorder,
    padding: 24,
    alignItems: 'center',
    ...shadows.card,
  },
  successIconWrap: {
    marginBottom: 18,
  },
  successIconOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: palette.orangeDim,
    borderWidth: 1,
    borderColor: palette.orangeBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: palette.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTick: {
    color: '#0d1117',
    fontSize: 34,
    fontWeight: '900',
  },
  successTitle: {
    color: palette.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  successText: {
    color: palette.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 10,
  },
  successSubText: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  successButton: {
    marginTop: 20,
    width: '100%',
    backgroundColor: palette.orange,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  successButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
