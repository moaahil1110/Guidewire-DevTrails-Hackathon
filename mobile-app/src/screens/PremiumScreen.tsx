import { useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { api } from "../api/client";
import { PrimaryButton } from "../components/FormControls";
import { ScreenLayout, cardStyles } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { palette } from "../theme";
import { CoverageTier, PremiumQuote } from "../types";

const tiers: CoverageTier[] = ["basic", "shield", "max"];

export function PremiumScreen() {
  const { token, user } = useAuth();
  const [quotes, setQuotes] = useState<PremiumQuote[]>([]);
  const [loading, setLoading] = useState(false);

  const loadQuotes = async () => {
    if (!token) {
      return;
    }
    try {
      setLoading(true);
      const data = await Promise.all(tiers.map((tier) => api.quote(token, tier)));
      setQuotes(data);
    } catch (error) {
      Alert.alert("Could not fetch premiums", `${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, [token]);

  const handlePurchase = async (tier: CoverageTier) => {
    if (!token) {
      return;
    }
    try {
      const policy = await api.purchasePolicy(token, tier);
      Alert.alert(
        "Policy activated",
        `${policy.tier.toUpperCase()} is active at Rs ${policy.weekly_premium}/week.`,
      );
    } catch (error) {
      Alert.alert("Purchase failed", `${error}`);
    }
  };

  return (
    <ScreenLayout
      title="Premium"
      subtitle="Forecast-aware quotes are pulled from the backend and priced against the worker profile."
    >
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadQuotes} tintColor={palette.primary} />}
      >
        <View style={cardStyles.card}>
          <Text style={styles.bannerTitle}>Pricing snapshot</Text>
          <Text style={styles.bannerText}>
            {user?.zone}, {user?.city} | risk score {user?.risk_score}
          </Text>
        </View>

        {quotes.map((quote) => (
          <View key={quote.tier} style={cardStyles.card}>
            <Text style={styles.tier}>{quote.tier.toUpperCase()}</Text>
            <Text style={styles.price}>Rs {quote.premium.toFixed(2)} / week</Text>
            <Text style={styles.copy}>Max payout Rs {quote.max_weekly_payout.toFixed(2)}</Text>
            <Text style={styles.copy}>
              {quote.weather_only ? "Weather only" : "Weather + social disruption"} coverage
            </Text>
            <Text style={styles.copy}>
              Zone multiplier {quote.zone_risk_multiplier} | Forecast {quote.forecast_risk_multiplier}
            </Text>
            <PrimaryButton
              label={quote.recommended ? "Buy recommended plan" : "Buy this plan"}
              onPress={() => handlePurchase(quote.tier)}
            />
          </View>
        ))}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  bannerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: palette.text,
    marginBottom: 6,
  },
  bannerText: {
    color: palette.muted,
  },
  tier: {
    color: palette.primary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  price: {
    color: palette.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  copy: {
    color: palette.muted,
    marginBottom: 5,
    lineHeight: 20,
  },
});
