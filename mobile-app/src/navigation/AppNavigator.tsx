import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, Text, View } from "react-native";

import { useAuth } from "../context/AuthContext";
import { ClaimsScreen } from "../screens/ClaimsScreen";
import { PolicyScreen } from "../screens/PolicyScreen";
import { PremiumScreen } from "../screens/PremiumScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { palette } from "../theme";

const Tab = createBottomTabNavigator();

function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: palette.background,
      }}
    >
      <ActivityIndicator size="large" color={palette.primary} />
      <Text style={{ marginTop: 12, color: palette.muted }}>Loading InsureIt...</Text>
    </View>
  );
}

export function AppNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.card },
        headerTintColor: palette.text,
        tabBarStyle: { backgroundColor: palette.surface },
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
      }}
    >
      {!token ? (
        <Tab.Screen
          name="Register"
          component={RegisterScreen}
          options={{ tabBarStyle: { display: "none" } }}
        />
      ) : (
        <>
          <Tab.Screen name="Policy" component={PolicyScreen} />
          <Tab.Screen name="Premium" component={PremiumScreen} />
          <Tab.Screen name="Claims" component={ClaimsScreen} />
          <Tab.Screen name="Register" component={RegisterScreen} options={{ title: "Account" }} />
        </>
      )}
    </Tab.Navigator>
  );
}
