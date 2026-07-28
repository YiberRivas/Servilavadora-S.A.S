import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { notificationService } from '../../src/services/notification.service';
import { colors, radii, shadows } from '../../src/theme';
import AppButton from '../../src/components/ui/AppButton';

const NOTIF_ICONS = {
  SOLICITUD: { icon: 'file-document-outline', color: '#12A594' },
  SERVICIO: { icon: 'washing-machine', color: '#3B82F6' },
  PAGO: { icon: 'cash', color: '#10B981' },
  TICKET: { icon: 'alert-circle-outline', color: '#EF4444' },
  SISTEMA: { icon: 'information-outline', color: '#6B7280' },
  RECORDATORIO: { icon: 'bell-outline', color: '#F59E0B' },
};

function NotificationCard({ notification, onPress, onMarkRead, onDelete }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, []);

  const notifConfig = NOTIF_ICONS[notification.tipo] || NOTIF_ICONS.SISTEMA;
  const iconColor = notification.color || notifConfig.color;
  const iconName = notification.icono || notifConfig.icon;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMin < 1) return 'Ahora';
    if (diffMin < 60) return `Hace ${diffMin}m`;
    if (diffHrs < 24) return `Hace ${diffHrs}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPress(notification)}
        style={[styles.card, { backgroundColor: colors.white }, !notification.leida && styles.cardUnread]}
      >
        <View style={[styles.cardIconWrap, { backgroundColor: iconColor + '15' }]}>
          <Icon source={iconName} size={22} color={iconColor} />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, !notification.leida && styles.cardTitleUnread]} numberOfLines={1}>
              {notification.titulo}
            </Text>
            <Text style={styles.cardTime}>{formatDate(notification.created_at)}</Text>
          </View>
          <Text style={styles.cardMessage} numberOfLines={2}>{notification.mensaje}</Text>
          <View style={styles.cardActions}>
            {!notification.leida && (
              <TouchableOpacity onPress={() => onMarkRead(notification.uuid)} style={styles.actionBtn}>
                <Icon source="check" size={16} color={colors.accent} />
                <Text style={[styles.actionText, { color: colors.accent }]}>Marcar leida</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => onDelete(notification.uuid)} style={styles.actionBtn}>
              <Icon source="delete-outline" size={16} color={colors.gray400} />
              <Text style={[styles.actionText, { color: colors.gray400 }]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
        {!notification.leida && <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      setError(null);
      const response = await notificationService.getNotifications({ page: pageNum, per_page: 20 });
      const data = response.data || [];
      if (append) {
        setNotifications((prev) => [...prev, ...data]);
      } else {
        setNotifications(data);
      }
      setHasMore(data.length === 20);
      setPage(pageNum);
    } catch (err) {
      setError(err.message || 'Error al cargar notificaciones');
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadNotifications();
      setIsLoading(false);
    })();
  }, [loadNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await loadNotifications(page + 1, true);
    setLoadingMore(false);
  }, [loadingMore, hasMore, page, loadNotifications]);

  const handlePress = useCallback(async (notification) => {
    if (!notification.leida) {
      await notificationService.markAsRead(notification.uuid);
      setNotifications((prev) =>
        prev.map((n) => n.uuid === notification.uuid ? { ...n, leida: 1 } : n)
      );
    }
  }, []);

  const handleMarkRead = useCallback(async (uuid) => {
    try {
      await notificationService.markAsRead(uuid);
      setNotifications((prev) =>
        prev.map((n) => n.uuid === uuid ? { ...n, leida: 1 } : n)
      );
    } catch (err) {
      Alert.alert('Error', 'No se pudo marcar como leida');
    }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: 1 })));
      Alert.alert('Listo', 'Todas las notificaciones marcadas como leidas');
    } catch (err) {
      Alert.alert('Error', 'No se pudieron marcar todas');
    }
  }, []);

  const handleDelete = useCallback(async (uuid) => {
    Alert.alert('Eliminar notificacion', 'Esta accion no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await notificationService.deleteNotification(uuid);
            setNotifications((prev) => prev.filter((n) => n.uuid !== uuid));
          } catch (err) {
            Alert.alert('Error', 'No se pudo eliminar');
          }
        },
      },
    ]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.leida).length;

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notificaciones</Text>
          <Text style={styles.headerSubtitle}>Cargando...</Text>
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </View>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notificaciones</Text>
          <Text style={styles.headerSubtitle}>Error al cargar</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.error + '15' }]}>
            <Icon source="alert-circle-outline" size={48} color={colors.error} />
          </View>
          <Text style={styles.emptyTitle}>Error al cargar</Text>
          <Text style={styles.emptyDesc}>{error}</Text>
          <TouchableOpacity onPress={loadNotifications} style={[styles.emptyBtn, { backgroundColor: colors.accent }]}>
            <Text style={styles.emptyBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={styles.headerRow}>
          <Text style={styles.headerSubtitle}>
            {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al dia'}
          </Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
              <Icon source="check-all" size={18} color={colors.accent} />
              <Text style={[styles.markAllText, { color: colors.accent }]}>Marcar todas</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.gray50 }]}>
            <Icon source="bell-off-outline" size={48} color={colors.gray300} />
          </View>
          <Text style={styles.emptyTitle}>Sin notificaciones</Text>
          <Text style={styles.emptyDesc}>Cuando tengas notificaciones apareceran aqui.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
          onScrollEndDrag={loadMore}
        >
          {notifications.map((notif) => (
            <NotificationCard
              key={notif.uuid}
              notification={notif}
              onPress={handlePress}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))}
          {loadingMore && (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color={colors.accent} />
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 26, color: colors.blue900 },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray500, marginTop: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  markAllText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  card: { flexDirection: 'row', padding: 16, borderRadius: radii.lg, gap: 12, ...shadows.sm },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: colors.accent },
  cardIconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  cardContent: { flex: 1, gap: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.gray600, flex: 1 },
  cardTitleUnread: { color: colors.blue900, fontFamily: 'Poppins_600SemiBold' },
  cardTime: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray400 },
  cardMessage: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray500, lineHeight: 18 },
  cardActions: { flexDirection: 'row', gap: 16, marginTop: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, alignSelf: 'flex-start', marginTop: 6 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIconWrap: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.blue900, textAlign: 'center' },
  emptyDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray500, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  emptyBtn: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 999 },
  emptyBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.white },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingMore: { paddingVertical: 20 },
});
