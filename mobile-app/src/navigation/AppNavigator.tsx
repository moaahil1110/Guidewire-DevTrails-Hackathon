import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { AccountScreen } from '../screens/AccountScreen';
import { ClaimsScreen } from '../screens/ClaimsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { PolicyScreen } from '../screens/PolicyScreen';
import { PremiumScreen } from '../screens/PremiumScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { palette, radius } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ short, label, focused }: { short: string; label: string; focused: boolean }) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        minWidth: 66,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: radius.md,
        backgroundColor: focused ? palette.orangeDim : 'transparent',
        borderWidth: 1,
        borderColor: focused ? palette.orangeBorder : 'transparent',
      }}
    >
      <Text
        style={{
          fontSize: 10,
          letterSpacing: 1,
          fontWeight: '800',
          color: focused ? palette.orangeLight : palette.textMuted,
        }}
      >
        {short}
      </Text>
      <Text
        style={{
          fontSize: 9,
          fontWeight: focused ? '700' : '500',
          color: focused ? palette.textPrimary : palette.textMuted,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: palette.bgCard,
          borderTopColor: palette.border,
          borderTopWidth: 1,
          height: 74,
          paddingBottom: 10,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon short="HM" label="Home" focused={focused} /> }}
      />
      <Tab.Screen
        name="Policy"
        component={PolicyScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon short="PL" label="Policy" focused={focused} /> }}
      />
      <Tab.Screen
        name="Premium"
        component={PremiumScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon short="PN" label="Plans" focused={focused} /> }}
      />
      <Tab.Screen
        name="Claims"
        component={ClaimsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon short="CL" label="Claims" focused={focused} /> }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon short="AC" label="Account" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { token } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
