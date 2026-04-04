import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { api } from "../api/client";
import { ScreenLayout, cardStyles } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { palette } from "../theme";
import { Policy } from "../types";

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export function PolicyScreen() {
  const { token, user, refreshProfile } = useAuth();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [message, setMessage] = useState("No active policy yet. Buy one from the Premium screen.");
  const [loading, setLoading] = useState(false);

  const loadPolicy = async () => {
    if (!token) {
      return;
    }
    try {
      setLoading(true);
      await refreshProfile();
      const nextPolicy = await api.activePolicy(token);
      setPolicy(nextPolicy);
      setMessage("");
    } catch (error) {
      setPolicy(null);
      setMessage(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPolicy();
    }, [token]),
  );

  return (
    <ScreenLayout
      title="Policy"
      subtitle="This screen reads the active policy directly from FastAPI so the mobile app mirrors live backend state."
    >
      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={loadPolicy} tintColor={palette.primary} />}>
        <View style={cardStyles.card}>
          <Text style={styles.heading}>{user?.full_name}</Text>
          <Text style={styles.copy}>
            {user?.platform} | {user?.zone}, {user?.city}
          </Text>
          <Text style={styles.copy}>
            Earnings Rs {user?.avg_daily_earnings}/day | Hourly Rs {user?.avg_hourly_earnings}
          </Text>
        </View>

        {policy ? (
          <View style={cardStyles.card}>
            <Text style={styles.heading}>{policy.tier.toUpperCase()} protection active</Text>
            <Text style={styles.copy}>Premium Rs {policy.weekly_premium}/week</Text>
            <Text style={styles.copy}>Max payout Rs {policy.max_weekly_payout}</Text>
            <Text style={styles.copy}>Status {policy.status}</Text>
            <Text style={styles.copy}>Coverage start {formatDate(policy.coverage_start)}</Text>
            <Text style={styles.copy}>Coverage end {formatDate(policy.coverage_end)}</Text>
          </View>
        ) : (
          <View style={cardStyles.card}>
            <Text style={styles.empty}>{message}</Text>
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    color: palette.text,
    fontWeight: "800",
    marginBottom: 8,
  },
  copy: {
    color: palette.muted,
    marginBottom: 6,
    lineHeight: 20,
  },
  empty: {
    color: palette.danger,
    lineHeight: 22,
  },
});
