import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { api } from "../api/client";
import { EmptyState } from "../components/EmptyState";
import { ScreenLayout, cardStyles } from "../components/Layout";
import { SectionHeader } from "../components/SectionHeader";
import { StatusPill } from "../components/StatusPill";
import { useAuth } from "../context/AuthContext";
import { palette, radius, spacing } from "../theme";
import { Policy } from "../types";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMoney(value: number) {
  return `Rs ${value.toFixed(2)}`;
}

function CoverageRow({
  label,
  included,
  note,
}: {
  label: string;
  included: boolean;
  note?: string;
}) {
  return (
    <View style={styles.coverageRow}>
      <View style={styles.coverageTextWrap}>
        <Text style={styles.coverageLabel}>{label}</Text>
        {note ? <Text style={styles.coverageNote}>{note}</Text> : null}
      </View>
      <Text style={[styles.coverageValue, { color: included ? palette.success : palette.danger }]}>
        {included ? "Included" : "Excluded"}
      </Text>
    </View>
  );
}

export function PolicyScreen({ navigation }: any) {
  const { token, user, refreshProfile } = useAuth();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [message, setMessage] = useState("No active policy yet. Buy one from Premium.");
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
      setMessage(`${error}`.replace(/^Error:\s*/, "") || "No active policy found.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPolicy();
    }, [token]),
  );

  const weatherCoverage = true;
  const socialCoverage = !!policy?.social_disruption_cover;
  const platformCoverage = !!policy?.extended_hours;

  return (
    <ScreenLayout
      title="Policy"
      subtitle="This screen reads the active policy directly from FastAPI so the mobile app mirrors live backend state."
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadPolicy} tintColor={palette.primary} />
        }
      >
        <View style={cardStyles.card}>
          <SectionHeader title={user?.full_name ?? "Delivery Partner"} subtitle={`${user?.platform ?? "-"} | ${user?.zone ?? "-"}, ${user?.city ?? "-"}`} />
          <Text style={styles.copy}>
            Earnings {formatMoney(user?.avg_daily_earnings ?? 0)}/day | Hourly{" "}
            {formatMoney(user?.avg_hourly_earnings ?? 0)}
          </Text>
        </View>

        {policy ? (
          <>
            <View style={cardStyles.card}>
              <SectionHeader
                title={`${policy.tier.toUpperCase()} protection active`}
                subtitle="Live policy details from the backend"
              />
              <View style={styles.statusRow}>
                <StatusPill status={policy.status} />
              </View>
              <Text style={styles.copy}>Premium {formatMoney(policy.weekly_premium)}/week</Text>
              <Text style={styles.copy}>Max payout {formatMoney(policy.max_weekly_payout)}</Text>
              <Text style={styles.copy}>Coverage start {formatDate(policy.coverage_start)}</Text>
              <Text style={styles.copy}>Coverage end {formatDate(policy.coverage_end)}</Text>
            </View>

            <View style={cardStyles.card}>
              <SectionHeader
                title="Coverage breakdown"
                subtitle="Included and excluded protections for the active plan"
              />
              <CoverageRow label="Heavy rain" included={weatherCoverage} />
              <CoverageRow label="Extreme heat" included={weatherCoverage} />
              <CoverageRow label="Flood / waterlogging" included={weatherCoverage} />
              <CoverageRow label="Curfew / bandh" included={socialCoverage} />
              <CoverageRow label="Platform downtime" included={platformCoverage} />
              <CoverageRow label="Health / accident" included={false} note="Excluded by product scope" />
              <CoverageRow label="Vehicle repair" included={false} note="Excluded by product scope" />
            </View>
          </>
        ) : (
          <EmptyState
            icon="📋"
            title="No active policy"
            subtitle={message || "Buy a plan from Premium to activate your weekly protection."}
            ctaLabel="Go to Premium"
            onPressCta={() => navigation.navigate("Premium")}
          />
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  copy: {
    color: palette.muted,
    lineHeight: 20,
    marginBottom: 6,
  },
  statusRow: {
    marginBottom: spacing.sm,
  },
  coverageRow: {
    alignItems: "center",
    borderBottomColor: palette.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  coverageTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  coverageLabel: {
    color: palette.text,
    fontWeight: "600",
    marginBottom: 2,
  },
  coverageNote: {
    color: palette.muted,
    fontSize: 12,
  },
  coverageValue: {
    borderRadius: radius.sm,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
});
