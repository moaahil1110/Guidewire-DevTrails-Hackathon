import { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { api } from "../api/client";
import { ScreenLayout, cardStyles } from "../components/Layout";
import { SectionHeader } from "../components/SectionHeader";
import { useAuth } from "../context/AuthContext";
import { palette, radius, spacing } from "../theme";
import { Claim, Policy } from "../types";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function HomeScreen({ navigation }: any) {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);

  const loadDashboard = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      const [policyResult, claimsResult] = await Promise.all([
        api.activePolicy(token).catch(() => null),
        api.claims(token).catch(() => [] as Claim[]),
      ]);
      setPolicy(policyResult);
      setClaims(claimsResult);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  const firstName = user?.full_name?.split(" ")[0] ?? "Partner";
  const totalPayout = useMemo(
    () =>
      claims.reduce((sum, claim) => {
        if (claim.status === "paid" || claim.status === "approved") {
          return sum + claim.payout_amount;
        }
        return sum;
      }, 0),
    [claims],
  );

  const quickActions = [
    { label: "View policy", target: "Policy", icon: "📋" },
    { label: "Browse plans", target: "Premium", icon: "💠" },
    { label: "Open claims", target: "Claims", icon: "⚡" },
    { label: "Profile", target: "Account", icon: "👤" },
  ];

  return (
    <ScreenLayout
      title="Home"
      subtitle="A quick mobile dashboard for active protection, payouts, and next actions."
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadDashboard} tintColor={palette.primary} />
        }
      >
        <View style={[cardStyles.card, styles.heroCard]}>
          <Text style={styles.greeting}>Welcome back, {firstName}</Text>
          <Text style={styles.heroCopy}>
            {policy
              ? `${policy.tier.toUpperCase()} protection is active for this week.`
              : "You do not have an active policy yet. Get covered before the next disruption."}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[cardStyles.card, styles.statCard]}>
            <Text style={styles.statValue}>{policy ? policy.tier.toUpperCase() : "--"}</Text>
            <Text style={styles.statLabel}>Active tier</Text>
          </View>
          <View style={[cardStyles.card, styles.statCard]}>
            <Text style={styles.statValue}>{claims.length}</Text>
            <Text style={styles.statLabel}>Claims</Text>
          </View>
          <View style={[cardStyles.card, styles.statCardWide]}>
            <Text style={styles.statValue}>{formatMoney(totalPayout)}</Text>
            <Text style={styles.statLabel}>Total payouts credited</Text>
          </View>
        </View>

        <View style={cardStyles.card}>
          <SectionHeader
            title="Quick actions"
            subtitle="Move directly to the core policy, pricing, claims, and account flows."
          />
          <View style={styles.actionGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.target}
                style={styles.actionCard}
                onPress={() => navigation.navigate(action.target)}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={cardStyles.card}>
          <SectionHeader title="Worker snapshot" subtitle="Profile data currently driving premium pricing." />
          <Text style={styles.snapshotLine}>Platform: {user?.platform ?? "-"}</Text>
          <Text style={styles.snapshotLine}>Zone: {user?.zone ?? "-"}, {user?.city ?? "-"}</Text>
          <Text style={styles.snapshotLine}>Risk score: {user?.risk_score ?? "-"}</Text>
          <Text style={styles.snapshotLine}>
            Average daily earnings: {user?.avg_daily_earnings ? formatMoney(user.avg_daily_earnings) : "-"}
          </Text>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: "#eef5ef",
    borderColor: "#cfe1d2",
  },
  greeting: {
    color: palette.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  heroCopy: {
    color: palette.muted,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
  },
  statCardWide: {
    width: "100%",
  },
  statValue: {
    color: palette.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    color: palette.muted,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionCard: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.md,
    borderWidth: 1,
    minWidth: 140,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  actionIcon: {
    fontSize: 22,
    marginBottom: spacing.xs,
  },
  actionLabel: {
    color: palette.text,
    fontWeight: "700",
  },
  snapshotLine: {
    color: palette.muted,
    lineHeight: 22,
    marginBottom: 4,
  },
});
