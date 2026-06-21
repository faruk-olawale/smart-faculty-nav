import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';
import { COLORS } from '../constants/theme';
import MapScreen from '../screens/MapScreen';
import BuildingScreen from '../screens/BuildingScreen';
import SearchScreen from '../screens/SearchScreen';
import NavigationScreen from '../screens/NavigationScreen';
import ARScreen from '../screens/ARScreen';
import QRScreen from '../screens/QRScreen';

function AssistantScreen() {
  return (
    <View style={{
      flex: 1, backgroundColor: COLORS.background,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ fontSize: 32, marginBottom: 12 }}>🤖</Text>
      <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '700' }}>
        AI Assistant
      </Text>
      <Text style={{ color: COLORS.textDim, fontSize: 13, marginTop: 6 }}>
        Coming in Stage 10
      </Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({ emoji, label, focused }: {
  emoji: string; label: string; focused: boolean;
}) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 6, gap: 2 }}>
      <Text style={{ fontSize: focused ? 21 : 19 }}>{emoji}</Text>
      <Text style={{
        fontSize: 9,
        color: focused ? COLORS.primary : COLORS.textDim,
        fontWeight: focused ? '700' : '400',
      }}>
        {label}
      </Text>
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.panel,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🗺️" label="Map" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔍" label="Search" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="QR"
        component={QRScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📱" label="QR" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Assistant"
        component={AssistantScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🤖" label="Assistant" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={Tabs} />
        <Stack.Screen name="Building" component={BuildingScreen} />
        <Stack.Screen name="Navigation" component={NavigationScreen} />
        <Stack.Screen
          name="AR"
          component={ARScreen}
          options={{ animation: 'fade' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
