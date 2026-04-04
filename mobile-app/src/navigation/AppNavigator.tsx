import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, Text, View } from "react-native";

import { useAuth } from "../context/AuthContext";
import { AccountScreen } from "../screens/AccountScreen";
import { ClaimsScreen } from "../screens/ClaimsScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { PolicyScreen } from "../screens/PolicyScreen";
import { PremiumScreen } from "../screens/PremiumScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { palette } from "../theme";

const Stack = createNativeStackNavigator();
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

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <Text style={{ color, fontSize: 18, fontWeight: "700" }}>{icon}</Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.card },
        headerTintColor: palette.text,
        tabBarStyle: { backgroundColor: palette.surface },
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} />,
        }}
      />
      <Tab.Screen
        name="Policy"
        component={PolicyScreen}
        options={{
          title: "Policy",
          tabBarIcon: ({ color }) => <TabIcon icon="📋" color={color} />,
        }}
      />
      <Tab.Screen
        name="Premium"
        component={PremiumScreen}
        options={{
          title: "Premium",
          tabBarIcon: ({ color }) => <TabIcon icon="💠" color={color} />,
        }}
      />
      <Tab.Screen
        name="Claims"
        component={ClaimsScreen}
        options={{
          title: "Claims",
          tabBarIcon: ({ color }) => <TabIcon icon="⚡" color={color} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.card },
        headerTintColor: palette.text,
        contentStyle: { backgroundColor: palette.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return token ? <MainTabs /> : <AuthStack />;
}
