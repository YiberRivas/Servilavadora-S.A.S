import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme';
import { notificationService } from '../../src/services/notification.service';
import storage from '../../src/storage';

const tabs = [
  { name: 'index', label: 'Inicio', iconFocused: 'home', iconUnfocused: 'home-outline' },
  { name: 'my-services', label: 'Mis Servicios', iconFocused: 'list-circle', iconUnfocused: 'list-circle-outline' },
  { name: 'notifications', label: 'Alertas', iconFocused: 'notifications', iconUnfocused: 'notifications-outline' },
  { name: 'companies', label: 'Empresas', iconFocused: 'storefront', iconUnfocused: 'storefront-outline' },
  { name: 'history', label: 'Historial', iconFocused: 'time', iconUnfocused: 'time-outline' },
  { name: 'profile', label: 'Perfil', iconFocused: 'person-circle', iconUnfocused: 'person-circle-outline' },
];

function TabIcon({ focused, color, iconName }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (iconName !== 'notifications' && iconName !== 'notifications-outline') return;
    let interval;
    const fetchCount = async () => {
      try {
        const token = await storage.getAccessToken();
        if (!token) return;
        const res = await notificationService.getUnreadCount();
        setUnreadCount(res.data?.count || 0);
      } catch {}
    };
    fetchCount();
    interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [iconName]);

  const isNotif = iconName === 'notifications' || iconName === 'notifications-outline';
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: 28 }}>
      <Ionicons name={focused ? iconName : iconName} size={22} color={color} />
      {isNotif && unreadCount > 0 && (
        <View style={{
          position: 'absolute', top: -4, right: -10,
          backgroundColor: colors.error, borderRadius: 10,
          minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontFamily: 'Inter_700Bold' }}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
        </View>
      )}
    </View>
  );
}

export default function AppLayout() {
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
