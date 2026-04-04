import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../components/FormControls";
import { ScreenLayout, cardStyles } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { palette } from "../theme";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export function AccountScreen() {
  const { user, signOut } = useAuth();

  return (
    <ScreenLayout
      title="Account"
      subtitle="Your profile details are loaded from the backend-backed authenticated session."
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={cardStyles.card}>
          <Text style={styles.name}>{user?.full_name ?? "Delivery Partner"}</Text>
          <Text style={styles.subtitle}>{user?.email ?? "No email available"}</Text>
          <Text style={styles.meta}>
            {user?.platform ?? "Platform"} rider in {user?.zone ?? "Zone"}, {user?.city ?? "City"}
          </Text>
        </View>

        <View style={cardStyles.card}>
          <Text style={styles.sectionTitle}>Profile details</Text>
          <DetailRow label="Phone" value={user?.phone_number ?? "-"} />
          <DetailRow label="Platform" value={user?.platform ?? "-"} />
          <DetailRow label="Zone" value={user?.zone ?? "-"} />
          <DetailRow label="City" value={user?.city ?? "-"} />
          <DetailRow label="Pincode" value={user?.pincode ?? "-"} />
          <DetailRow label="Risk score" value={user?.risk_score != null ? String(user.risk_score) : "-"} />
          <DetailRow
            label="Daily earnings"
            value={user?.avg_daily_earnings != null ? `Rs ${user.avg_daily_earnings}` : "-"}
          />
          <DetailRow
            label="Hourly earnings"
            value={user?.avg_hourly_earnings != null ? `Rs ${user.avg_hourly_earnings}` : "-"}
          />
        </View>

        <View style={cardStyles.card}>
          <Text style={styles.sectionTitle}>Session</Text>
          <Text style={styles.meta}>
            Signing out clears the local token and returns the app to the authentication flow once
            navigation is refactored.
          </Text>
          <PrimaryButton label="Sign out" onPress={signOut} tone="secondary" />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  name: {
    color: palette.text,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    color: palette.primary,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  meta: {
    color: palette.muted,
    lineHeight: 20,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  detailRow: {
    borderBottomColor: palette.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  detailLabel: {
    color: palette.muted,
    flex: 1,
    marginRight: 12,
  },
  detailValue: {
    color: palette.text,
    flex: 1,
    fontWeight: "600",
    textAlign: "right",
  },
});
