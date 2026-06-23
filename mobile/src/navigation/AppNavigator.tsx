import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';
import { Map, Search, QrCode, Bot } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import MapScreen from '../screens/MapScreen';
import BuildingScreen from '../screens/BuildingScreen';
import SearchScreen from '../screens/SearchScreen';
import NavigationScreen from '../screens/NavigationScreen';
import ARScreen from '../screens/ARScreen';
import QRScreen from '../screens/QRScreen';
import AssistantScreen from '../screens/AssistantScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({ Icon, label, focused }: {
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 6, gap: 4 }}>
      <Icon
        size={focused ? 23 : 21}
        color={focused ? COLORS.primary : COLORS.textDim}
        strokeWidth={focused ? 2.4 : 2}
      />
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
            <TabIcon Icon={Map} label="Map" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Search} label="Search" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="QR"
        component={QRScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={QrCode} label="QR" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Assistant"
        component={AssistantScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Bot} label="Assistant" focused={focused} />
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
