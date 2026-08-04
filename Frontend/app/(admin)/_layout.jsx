import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme';

const tabs = [
  { name: 'index', label: 'Solicitudes', iconFocused: 'clipboard', iconUnfocused: 'clipboard-outline' },
  { name: 'profile', label: 'Perfil', iconFocused: 'person-circle', iconUnfocused: 'person-circle-outline' },
];

function TabIcon({ focused, color, iconName }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: 28 }}>
      <Ionicons name={iconName} size={22} color={color} />
    </View>
  );
}

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.92)',
          borderTopColor: colors.gray100,
          borderTopWidth: 0.5,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 10,
          letterSpacing: 0.3,
          marginTop: 2,
        },
        tabBarItemStyle: {
          gap: 0,
          paddingTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ focused, color }) => (
              <TabIcon focused={focused} color={color} iconName={focused ? tab.iconFocused : tab.iconUnfocused} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
