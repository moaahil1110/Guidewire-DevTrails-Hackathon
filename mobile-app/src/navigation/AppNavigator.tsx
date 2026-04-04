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
import { palette } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', minWidth: 56 }}>
      <Text
        style={{
          fontSize: 16,
          marginBottom: 3,
          color: focused ? palette.orange : palette.textMuted,
        }}
      >
        {icon}
      </Text>
      <View
        style={{
          width: 12,
          height: 3,
          borderRadius: 999,
          backgroundColor: focused ? palette.orange : 'transparent',
          marginBottom: 5,
        }}
      />
      <Text
        style={{
          fontSize: 10,
          fontWeight: focused ? '700' : '500',
          color: focused ? palette.orange : palette.textMuted,
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
          backgroundColor: '#FFFFFF',
          borderTopColor: palette.border,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="⌂" label="Home" focused={focused} /> }}
      />
      <Tab.Screen
        name="Policy"
        component={PolicyScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="▣" label="Policy" focused={focused} /> }}
      />
      <Tab.Screen
        name="Premium"
        component={PremiumScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="◫" label="Plans" focused={focused} /> }}
      />
      <Tab.Screen
        name="Claims"
        component={ClaimsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="◎" label="Claims" focused={focused} /> }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="◌" label="Account" focused={focused} /> }}
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
