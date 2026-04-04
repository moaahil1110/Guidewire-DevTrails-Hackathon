import { useCallback, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { api } from "../api/client";
import { PrimaryButton } from "../components/FormControls";
import { ScreenLayout, cardStyles } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { palette, radius, spacing } from "../theme";
import { CoverageTier, Policy, PremiumQuote } from "../types";

const TIER_META: Record<
  CoverageTier,
  {
    title: string;
    accent: string;
    tagline: string;
    features: string[];
  }
> = {
  basic: {
    title: "Basic",
    accent: "#2f7abf",
    tagline: "Weather-only protection",
    features: ["Heavy rain cover", "Extreme heat cover", "Lower weekly premium"],
  },
  shield: {
    title: "Shield",
    accent: palette.secondary,
    tagline: "Balanced protection",
    features: ["Weather + social disruptions", "Recommended plan", "Better payout cap"],
  },
  max: {
    title: "Max",
    accent: "#7856c8",
    tagline: "Highest payout ceiling",
    features: ["Extended cover", "Best for peak-risk weeks", "Maximum payout limit"],
  },
};

function formatMoney(value: number) {
  return `Rs ${value.toFixed(2)}`;
}

function LoadingCard() {
  return (
    <View style={[cardStyles.card, styles.loadingCard]}>
      <View style={[styles.skeleton, styles.skeletonTitle]} />
      <View style={[styles.skeleton, styles.skeletonLine]} />
      <View style={[styles.skeleton, styles.skeletonLineShort]} />
      <View style={[styles.skeleton, styles.skeletonButton]} />
    </View>
  );
}

export function PremiumScreen() {
  const { token, user } = useAuth();
  const [quotes, setQuotes] = useState<PremiumQuote[]>([]);
  const [activePolicy, setActivePolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState<CoverageTier | null>(null);

  const loadQuotesAndPolicy = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      const [quoteData, activePolicyResult] = await Promise.all([
        Promise.all((["basic", "shield", "max"] as CoverageTier[]).map((tier) => api.quote(token, tier))),
        api.activePolicy(token).catch(() => null),
      ]);
      setQuotes(quoteData);
      setActivePolicy(activePolicyResult);
    } catch (error) {
      Alert.alert("Could not fetch premiums", `${error}`.replace(/^Error:\s*/, ""));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadQuotesAndPolicy();
    }, [loadQuotesAndPolicy]),
  );

  const handlePurchase = async (tier: CoverageTier) => {
    if (!token) {
      return;
    }

    if (activePolicy) {
      Alert.alert(
        "Policy already active",
        `You already have ${activePolicy.tier.toUpperCase()} active for this week.`,
      );
      return;
    }

    try {
      setPurchasing(tier);
      const policy = await api.purchasePolicy(token, tier);
      setActivePolicy(policy);
      Alert.alert(
        "Policy activated",
        `${policy.tier.toUpperCase()} is active at ${formatMoney(policy.weekly_premium)} per week.`,
      );
    } catch (error) {
      Alert.alert("Purchase failed", `${error}`.replace(/^Error:\s*/, ""));
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <ScreenLayout
      title="Premium"
      subtitle="Quotes are calculated from the live worker profile and current backend pricing rules."
    >
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadQuotesAndPolicy}
            tintColor={palette.primary}
          />
        }
      >
        <View style={cardStyles.card}>
          <Text style={styles.bannerTitle}>Pricing snapshot</Text>
          <Text style={styles.bannerText}>
            {user?.zone}, {user?.city} | risk score {user?.risk_score}
          </Text>
          {activePolicy ? (
            <View style={styles.activeBanner}>
              <Text style={styles.activeBannerText}>
                Active this week: {activePolicy.tier.toUpperCase()} at{" "}
                {formatMoney(activePolicy.weekly_premium)}
              </Text>
            </View>
          ) : (
            <Text style={styles.bannerHint}>
              No active policy found. Choose one of the plans below to activate coverage.
            </Text>
          )}
        </View>

        {loading && quotes.length === 0 ? (
          <>
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </>
        ) : (
          quotes.map((quote) => {
            const meta = TIER_META[quote.tier];
            const isActive = activePolicy?.tier === quote.tier;
            const isBlockedByActivePolicy = !!activePolicy && !isActive;

            return (
              <View
                key={quote.tier}
                style={[
                  cardStyles.card,
                  styles.planCard,
                  quote.recommended && styles.recommendedCard,
                  isActive && styles.activePlanCard,
                ]}
              >
                <View style={styles.topRow}>
                  <View>
                    <View style={[styles.tierBadge, { borderColor: meta.accent }]}>
                      <Text style={[styles.tierBadgeText, { color: meta.accent }]}>
                        {meta.title}
                      </Text>
                    </View>
                    <Text style={styles.tagline}>{meta.tagline}</Text>
                  </View>
                  {quote.recommended ? (
                    <View style={styles.recommendedPill}>
                      <Text style={styles.recommendedText}>Recommended</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.price}>{formatMoney(quote.premium)} / week</Text>
                <Text style={styles.copy}>Max payout {formatMoney(quote.max_weekly_payout)}</Text>
                <Text style={styles.copy}>
                  {quote.weather_only ? "Weather-only cover" : "Weather + social disruption cover"}
                </Text>
                <Text style={styles.copy}>Zone multiplier {quote.zone_risk_multiplier}</Text>

                <View style={styles.featureList}>
                  {meta.features.map((feature) => (
                    <Text key={feature} style={styles.featureItem}>
                      • {feature}
                    </Text>
                  ))}
                </View>

                {isActive ? (
                  <View style={styles.activePlanNotice}>
                    <Text style={styles.activePlanNoticeText}>Currently active</Text>
                  </View>
                ) : (
                  <PrimaryButton
                    label={
                      isBlockedByActivePolicy
                        ? "Another policy is already active"
                        : purchasing === quote.tier
                          ? "Activating..."
                          : quote.recommended
                            ? "Buy recommended plan"
                            : "Buy this plan"
                    }
                    onPress={() => handlePurchase(quote.tier)}
                    disabled={!!purchasing || isBlockedByActivePolicy}
                  />
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  bannerTitle: {
    color: palette.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  bannerText: {
    color: palette.muted,
    marginBottom: 10,
  },
  bannerHint: {
    color: palette.muted,
    lineHeight: 20,
  },
  activeBanner: {
    backgroundColor: "#e4f3ea",
    borderColor: "#b7d8c2",
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  activeBannerText: {
    color: palette.success,
    fontWeight: "700",
  },
  loadingCard: {
    gap: spacing.sm,
  },
  skeleton: {
    backgroundColor: "#ece6da",
    borderRadius: radius.sm,
  },
  skeletonTitle: {
    height: 24,
    width: "35%",
  },
  skeletonLine: {
    height: 16,
    width: "70%",
  },
  skeletonLineShort: {
    height: 16,
    width: "50%",
  },
  skeletonButton: {
    height: 46,
    marginTop: spacing.sm,
    width: "100%",
  },
  planCard: {
    paddingTop: spacing.md,
  },
  recommendedCard: {
    borderColor: palette.secondary,
    borderWidth: 2,
  },
  activePlanCard: {
    borderColor: palette.success,
    borderWidth: 2,
  },
  topRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  tierBadge: {
    alignSelf: "flex-start",
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  tierBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  tagline: {
    color: palette.muted,
    fontSize: 13,
  },
  recommendedPill: {
    backgroundColor: palette.secondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  recommendedText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  price: {
    color: palette.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  copy: {
    color: palette.muted,
    lineHeight: 20,
    marginBottom: 4,
  },
  featureList: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  featureItem: {
    color: palette.text,
    lineHeight: 20,
    marginBottom: 2,
  },
  activePlanNotice: {
    alignItems: "center",
    backgroundColor: "#e4f3ea",
    borderColor: "#b7d8c2",
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.sm,
  },
  activePlanNoticeText: {
    color: palette.success,
    fontWeight: "700",
  },
});
