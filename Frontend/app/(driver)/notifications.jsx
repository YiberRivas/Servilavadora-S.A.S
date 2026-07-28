import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { notificationService } from '../../src/services/notification.service';
import { colors, radii, shadows } from '../../src/theme';

const TIPO_COLORS = {
  SERVICIO: colors.accent,
  PAGO: colors.success || '#10B981',
  SISTEMA: colors.info || '#3B82F6',
  ALERTA: colors.warning || '#F59E0B',
  MANTENIMIENTO: '#8B5CF6',
};

function NotificationCard({ item, onPress }) {
  const isLeido = item.leido === 1;
  const color = TIPO_COLORS[item.tipo] || colors.gray400;

  return (
    <TouchableOpacity
      style={[styles.notifCard, isLeido && styles.notifCardRead]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.notifIcon, { backgroundColor: `${color}15` }]}>
        <Icon source={item.icono || 'bell-outline'} size={20} color={color} />
      </View>
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, isLeido && styles.notifTitleRead]} numberOfLines={1}>{item.titulo}</Text>
        <Text style={styles.notifMessage} numberOfLines={2}>{item.mensaje}</Text>
        <Text style={styles.notifTime}>{item.tiempo}</Text>
      </View>
      {!isLeido && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const result = await notificationService.getNotifications({ page: 1, per_page: 50 });
      setNotifications(result.data?.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, leido: 1 })));
    } catch {}
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alertas</Text>
        {notifications.some((n) => n.leido === 0) && (
          <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.7}>
            <Text style={styles.markAllRead}>Marcar todo leido</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.uuid}
        renderItem={({ item }) => (
          <NotificationCard
            item={item}
            onPress={async () => {
              try {
                await notificationService.markAsRead(item.uuid);
                setNotifications((prev) => prev.map((n) => n.uuid === item.uuid ? { ...n, leido: 1 } : n));
              } catch {}
            }}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadNotifications(true)} colors={[colors.accent]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon source="bell-off-outline" size={48} color={colors.gray300 || '#D1D5DB'} />
            <Text style={styles.emptyText}>No tienes alertas</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 || '#F9FAFB' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16, backgroundColor: colors.white },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: colors.blue900 },
  markAllRead: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.accent },
  listContent: { padding: 20, paddingBottom: 24 },
  notifCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, marginBottom: 10, ...shadows.sm },
  notifCardRead: { opacity: 0.65 },
  notifIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
  notifContent: { flex: 1 },
  notifTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.blue900 },
  notifTitleRead: { fontFamily: 'Inter_500Medium', color: colors.gray600 || '#4B5563' },
  notifMessage: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray500 || '#6B7280', marginTop: 4, lineHeight: 18 },
  notifTime: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray400, marginTop: 6 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: 6, marginLeft: 8 },
  empty: { alignItems: 'center', paddingTop: 64 },
  emptyText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.gray400, marginTop: 12 },
});
