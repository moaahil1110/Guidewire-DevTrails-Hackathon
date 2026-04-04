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
import { EmptyState } from "../components/EmptyState";
import { PrimaryButton } from "../components/FormControls";
import { ScreenLayout, cardStyles } from "../components/Layout";
import { SectionHeader } from "../components/SectionHeader";
import { StatusPill } from "../components/StatusPill";
import { useAuth } from "../context/AuthContext";
import { palette, spacing } from "../theme";
import { Claim, DisruptionType } from "../types";

const DISRUPTION_OPTIONS: Array<{
  label: string;
  type: DisruptionType;
  hours: number;
}> = [
  { label: "Heavy rain", type: "heavy_rain", hours: 3 },
  { label: "Extreme heat", type: "extreme_heat", hours: 2.5 },
  { label: "Flood", type: "flood", hours: 4 },
  { label: "Curfew", type: "curfew", hours: 5 },
  { label: "Platform downtime", type: "platform_downtime", hours: 3 },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDisruption(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ClaimsScreen() {
  const { token } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [lastPayoutMessage, setLastPayoutMessage] = useState(
    "Trigger a disruption to simulate auto-claim creation and payout confirmation.",
  );

  const loadClaims = async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      const data = await api.claims(token);
      setClaims(data);
    } catch (error) {
      Alert.alert("Could not load claims", `${error}`.replace(/^Error:\s*/, ""));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadClaims();
    }, [token]),
  );

  const runManualSimulation = async (disruptionType: DisruptionType, blockedHours: number) => {
    if (!token) {
      return;
    }

    try {
      setTriggering(disruptionType);
      const result = await api.simulateTrigger(token, disruptionType, blockedHours);

      if (result.claim) {
        setLastPayoutMessage(
          `${formatDisruption(result.disruption_type ?? disruptionType)} triggered. Auto-claim #${
            result.claim.id
          } paid ${formatMoney(result.claim.payout_amount)} with ref ${
            result.claim.payout_reference
          }.`,
        );
      } else {
        setLastPayoutMessage(result.reason);
      }

      await loadClaims();
    } catch (error) {
      Alert.alert("Simulation failed", `${error}`.replace(/^Error:\s*/, ""));
    } finally {
      setTriggering(null);
    }
  };

  const runWeatherSimulation = async () => {
    if (!token) {
      return;
    }

    try {
      setTriggering("weather");
      const result = await api.weatherCheck(token, 12.9716, 77.5946, 4);
      if (result.claim) {
        setLastPayoutMessage(
          `Weather mock trigger paid ${formatMoney(result.claim.payout_amount)} with ref ${
            result.claim.payout_reference
          }.`,
        );
      } else {
        setLastPayoutMessage(result.reason);
      }
      await loadClaims();
    } catch (error) {
      Alert.alert("Weather trigger failed", `${error}`.replace(/^Error:\s*/, ""));
    } finally {
      setTriggering(null);
    }
  };

  return (
    <ScreenLayout
      title="Claims"
      subtitle="Trigger disruptions and inspect the claim records created by the backend."
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadClaims} tintColor={palette.primary} />
        }
      >
        <View style={cardStyles.card}>
          <SectionHeader
            title="Auto-claim simulator"
            subtitle="Manual simulations use multiple disruption types. Weather simulation currently runs in mock mode."
          />
          <Text style={styles.copy}>{lastPayoutMessage}</Text>

          <View style={styles.buttonGroup}>
            {DISRUPTION_OPTIONS.map((option) => (
              <PrimaryButton
                key={option.type}
                label={
                  triggering === option.type
                    ? `Triggering ${option.label}...`
                    : `Simulate ${option.label}`
                }
                onPress={() => runManualSimulation(option.type, option.hours)}
                disabled={!!triggering}
                tone="secondary"
              />
            ))}
            <PrimaryButton
              label={triggering === "weather" ? "Running weather trigger..." : "Simulate weather trigger"}
              onPress={runWeatherSimulation}
              disabled={!!triggering}
            />
          </View>
        </View>

        {claims.length === 0 && !loading ? (
          <EmptyState
            icon="⚡"
            title="No claims yet"
            subtitle="Run one of the simulator actions above to create and inspect your first payout record."
          />
        ) : (
          claims.map((claim) => (
            <View key={claim.id} style={cardStyles.card}>
              <SectionHeader
                title={formatDisruption(claim.disruption_type)}
                subtitle={formatDate(claim.created_at)}
              />
              <View style={styles.statusRow}>
                <StatusPill status={claim.status} />
              </View>
              <Text style={styles.amount}>{formatMoney(claim.payout_amount)}</Text>
              <Text style={styles.meta}>Blocked hours: {claim.blocked_hours}</Text>
              <Text style={styles.meta}>Reference: {claim.payout_reference ?? "Pending"}</Text>
              <Text style={styles.meta}>Fraud score: {claim.fraud_score.toFixed(2)}</Text>
              <Text style={styles.meta}>Source: {claim.trigger_source}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  copy: {
    color: palette.muted,
    lineHeight: 20,
  },
  buttonGroup: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statusRow: {
    marginBottom: spacing.sm,
  },
  amount: {
    color: palette.text,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  meta: {
    color: palette.muted,
    lineHeight: 20,
    marginBottom: 4,
  },
});
