import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { repartidorService } from '../../src/services/repartidor.service';
import { colors, radii, shadows } from '../../src/theme';
import endpoints from '../../src/api/endpoints';

function StatCard({ icon, label, value, color, delay }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.statCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <Icon source={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

export default function DriverDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const result = await repartidorService.dashboard();
      setDashboard(result.data);
    } catch (err) {
      setError(err.message || 'Error al cargar dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '0h 0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Icon source="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadDashboard()}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadDashboard(true)} colors={[colors.accent]} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.nombre_completo?.split(' ')[0] || 'Repartidor'}</Text>
          <Text style={styles.subgreeting}>Tu dashboard de entregas</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Text style={styles.avatarText}>{(user?.nombre_completo || 'R').charAt(0)}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard icon="clock-outline" label="Pendientes" value={dashboard?.entregasPendientes || 0} color={colors.warning || '#F59E0B'} delay={0} />
        <StatCard icon="truck-delivery-outline" label="En curso" value={dashboard?.entregasActivas || 0} color={colors.accent} delay={80} />
        <StatCard icon="check-circle-outline" label="Finalizadas" value={dashboard?.entregasFinalizadas || 0} color={colors.success || '#10B981'} delay={160} />
        <StatCard icon="road-variant" label="Km recorridos" value={`${dashboard?.kilometrosRecorridos || 0} km`} color={colors.blue900} delay={240} />
      </View>

      <View style={styles.timeCard}>
        <View style={styles.timeRow}>
          <Icon source="clock-fast" size={20} color={colors.accent} />
          <Text style={styles.timeLabel}>Tiempo trabajado</Text>
        </View>
        <Text style={styles.timeValue}>{formatTime(dashboard?.tiempoTrabajado)}</Text>
      </View>

      <View style={styles.availabilityCard}>
        <View style={styles.availRow}>
          <Icon source={dashboard?.disponibilidad ? 'check-circle' : 'close-circle'} size={20} color={dashboard?.disponibilidad ? (colors.success || '#10B981') : colors.gray400} />
          <Text style={styles.availLabel}>
            {dashboard?.disponibilidad ? 'Disponible para entregas' : 'No disponible'}
          </Text>
        </View>
        {dashboard?.calificacion && (
          <View style={styles.ratingRow}>
            <Icon source="star" size={16} color="#F59E0B" />
            <Text style={styles.ratingText}>{dashboard.calificacion}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.assignmentsBtn} onPress={() => router.push('/(driver)/assignments')} activeOpacity={0.7}>
        <Icon source="clipboard-check-outline" size={22} color={colors.white} />
        <Text style={styles.assignmentsBtnText}>Ver mis asignaciones</Text>
        <Icon source="chevron-right" size={20} color={colors.white} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 || '#F9FAFB' },
  scrollContent: { padding: 20, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.gray50 || '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontFamily: 'Poppins_700Bold', fontSize: 22, color: colors.blue900 },
  subgreeting: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray500 || '#6B7280', marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: colors.white },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: { width: '48%', backgroundColor: colors.white, borderRadius: radii.lg, padding: 16, ...shadows.sm },
  statIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: colors.blue900 },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray500 || '#6B7280', marginTop: 2 },
  timeCard: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 16, marginBottom: 12, ...shadows.sm },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  timeLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.gray600 || '#4B5563' },
  timeValue: { fontFamily: 'Poppins_700Bold', fontSize: 24, color: colors.blue900 },
  availabilityCard: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 16, marginBottom: 12, ...shadows.sm },
  availRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  availLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.gray700 || '#374151' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  ratingText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.gray700 || '#374151' },
  assignmentsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.accent, borderRadius: radii.lg, padding: 16, marginTop: 8, ...shadows.md },
  assignmentsBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.white, flex: 1, marginLeft: 10 },
  errorText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.gray600 || '#4B5563', marginTop: 12, textAlign: 'center' },
  retryBtn: { marginTop: 16, backgroundColor: colors.accent, paddingHorizontal: 24, paddingVertical: 10, borderRadius: radii.full },
  retryText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.white },
});
