import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { paymentService } from '../../src/services/payment.service';
import { formatCurrency } from '../../src/utils/formatters';
import { colors, radii, shadows } from '../../src/theme';

const STATUS_COLORS = {
  PENDIENTE: '#F59E0B',
  APROBADO: '#10B981',
  RECHAZADO: '#EF4444',
  CANCELADO: '#6B7280',
};

function PaymentCard({ pago, index, onPress }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const statusColor = pago.estado_color || STATUS_COLORS[pago.estado_codigo] || colors.gray400;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity activeOpacity={0.7} onPress={() => onPress(pago)} style={[styles.card, { backgroundColor: colors.white }]}>
        <View style={styles.cardRow}>
          <View style={styles.cardLeft}>
            <Icon source="cash" size={20} color={colors.accent} />
            <View>
              <Text style={styles.cardAmount}>{formatCurrency(pago.valor)}</Text>
              <Text style={styles.cardMethod}>{pago.metodo_pago}</Text>
            </View>
          </View>
          <View style={styles.cardRight}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{pago.estado_pago}</Text>
            </View>
            <Text style={styles.cardDate}>{formatDate(pago.fecha_pago || pago.created_at)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadPayments = useCallback(async () => {
    try {
      setError(null);
      const response = await paymentService.getPayments({ page: 1, per_page: 50 });
      setPayments(response.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar pagos');
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadPayments();
      setIsLoading(false);
    })();
  }, [loadPayments]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  }, [loadPayments]);

  const handlePress = useCallback((pago) => {
    router.push({ pathname: '/(modals)/payment-detail', params: { pagoUuid: pago.uuid } });
  }, [router]);

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon source="arrow-left" size={24} color={colors.blue900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historial de Pagos</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </View>
    );
  }

  if (error && payments.length === 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon source="arrow-left" size={24} color={colors.blue900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historial de Pagos</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.error + '15' }]}>
            <Icon source="alert-circle-outline" size={48} color={colors.error} />
          </View>
          <Text style={styles.emptyTitle}>Error al cargar</Text>
          <Text style={styles.emptyDesc}>{error}</Text>
          <TouchableOpacity onPress={loadPayments} style={[styles.emptyBtn, { backgroundColor: colors.accent }]}>
            <Text style={styles.emptyBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon source="arrow-left" size={24} color={colors.blue900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Pagos</Text>
        <View style={{ width: 40 }} />
      </View>

      {payments.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.gray50 }]}>
            <Icon source="cash-off" size={48} color={colors.gray300} />
          </View>
          <Text style={styles.emptyTitle}>Sin pagos</Text>
          <Text style={styles.emptyDesc}>Aun no tienes pagos registrados.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        >
          {payments.map((pago, index) => (
            <PaymentCard key={pago.uuid} pago={pago} index={index} onPress={handlePress} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: colors.blue900 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  card: { padding: 16, borderRadius: radii.lg, ...shadows.sm },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  cardAmount: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: colors.blue900 },
  cardMethod: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray500 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  statusText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  cardDate: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray400 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIconWrap: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.blue900, textAlign: 'center' },
  emptyDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray500, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  emptyBtn: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 999 },
  emptyBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.white },
});
