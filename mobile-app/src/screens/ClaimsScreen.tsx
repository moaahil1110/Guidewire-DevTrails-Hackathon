import { useCallback, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { api } from "../api/client";
import { PrimaryButton } from "../components/FormControls";
import { ScreenLayout, cardStyles } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { palette } from "../theme";
import { Claim } from "../types";

function formatMoney(value: number) {
  return `Rs ${value.toFixed(2)}`;
}

export function ClaimsScreen() {
  const { token } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
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
      Alert.alert("Could not load claims", `${error}`);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadClaims();
    }, [token]),
  );

  const runSimulation = async (mode: "manual" | "weather") => {
    if (!token) {
      return;
    }
    try {
      setLoading(true);
      const result =
        mode === "manual"
          ? await api.simulateTrigger(token, "platform_downtime", 3)
          : await api.weatherCheck(token, 12.9716, 77.5946, 4);

      if (result.claim) {
        setLastPayoutMessage(
          `${result.disruption_type} triggered. Auto-claim #${result.claim.id} paid ${formatMoney(
            result.claim.payout_amount,
          )} with ref ${result.claim.payout_reference}.`,
        );
      } else {
        setLastPayoutMessage(result.reason);
      }

      await loadClaims();
    } catch (error) {
      Alert.alert("Simulation failed", `${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout
      title="Claims"
      subtitle="This is the demo control room: trigger a disruption and watch the backend create a paid claim automatically."
    >
      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={loadClaims} tintColor={palette.primary} />}>
        <View style={cardStyles.card}>
          <Text style={styles.heading}>Auto-claim simulator</Text>
          <Text style={styles.copy}>{lastPayoutMessage}</Text>
          <PrimaryButton label="Simulate platform disruption" onPress={() => runSimulation("manual")} disabled={loading} />
          <PrimaryButton label="Simulate weather trigger" onPress={() => runSimulation("weather")} disabled={loading} tone="secondary" />
        </View>

        {claims.map((claim) => (
          <View key={claim.id} style={cardStyles.card}>
            <Text style={styles.claimTitle}>{claim.disruption_type.replace("_", " ").toUpperCase()}</Text>
            <Text style={styles.copy}>Payout {formatMoney(claim.payout_amount)}</Text>
            <Text style={styles.copy}>Blocked hours {claim.blocked_hours}</Text>
            <Text style={styles.copy}>Status {claim.status}</Text>
            <Text style={styles.copy}>Ref {claim.payout_reference ?? "pending"}</Text>
          </View>
        ))}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: palette.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
  },
  copy: {
    color: palette.muted,
    lineHeight: 20,
    marginBottom: 8,
  },
  claimTitle: {
    color: palette.primary,
    fontWeight: "700",
    marginBottom: 8,
  },
});
