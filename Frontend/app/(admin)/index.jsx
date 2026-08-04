import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, RefreshControl, Alert } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SERVICE_STATUS_CONFIG } from '../../src/constants';
import { formatCurrency } from '../../src/utils/formatters';
import { colors, radii, shadows } from '../../src/theme';
import { requestService } from '../../src/services/request.service';
import AppButton from '../../src/components/ui/AppButton';
import SkeletonCard from '../../src/components/ui/SkeletonCard';

function AnimatedSection({ children, delay = 0 }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
}

const SolicitudCard = React.memo(function SolicitudCard({ solicitud, index, onAccept, onReject, processingId }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, []);

  const st = SERVICE_STATUS_CONFIG[solicitud.status] || SERVICE_STATUS_CONFIG.pendiente;
  const isProcessing = processingId === solicitud.uuid;
  const isPendiente = solicitud.status === 'solicitud_enviada' || solicitud.status === 'pendiente';

  const fechaStr = useMemo(() => {
    if (!solicitud.fechaSolicitud) return '';
    const d = new Date(solicitud.fechaSolicitud);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }, [solicitud.fechaSolicitud]);

  return (
    <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }, styles.cardMargin]}>
      <View style={[styles.card, { backgroundColor: colors.white }]}>
        <View style={styles.cardTop}>
          <View style={[styles.cardAvatar, { backgroundColor: colors.accent + '15' }]}>
            <Icon source="account" size={20} color={colors.accent} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardClient} numberOfLines={1}>{solicitud.clienteNombre || 'Cliente'}</Text>
            <Text style={styles.cardCode}>{solicitud.serviceCode || solicitud.uuid?.slice(0, 8)}</Text>
          </View>
          <View style={[styles.cardBadge, { backgroundColor: st.bg }]}>
            <Icon source={st.icon} size={11} color={st.color} />
            <Text style={[styles.cardBadgeText, { color: st.color }]} numberOfLines={1}>{st.label}</Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.cardDetailRow}>
            <Icon source="washing-machine" size={13} color={colors.gray400} />
            <Text style={styles.cardDetailText}>{solicitud.lavadoraMarca} {solicitud.lavadoraModelo} - {solicitud.capacidad}</Text>
          </View>
          {solicitud.direccion && (
            <View style={styles.cardDetailRow}>
              <Icon source="map-marker-outline" size={13} color={colors.gray400} />
              <Text style={styles.cardDetailText} numberOfLines={1}>{solicitud.direccion}</Text>
            </View>
          )}
          {fechaStr && (
            <View style={styles.cardDetailRow}>
              <Icon source="calendar-outline" size={13} color={colors.gray400} />
              <Text style={styles.cardDetailText}>{fechaStr}</Text>
            </View>
          )}
          {solicitud.valorTotal > 0 && (
            <View style={styles.cardDetailRow}>
              <Icon source="cash" size={13} color={colors.gray400} />
              <Text style={styles.cardDetailText}>{formatCurrency(solicitud.valorTotal)}</Text>
            </View>
          )}
        </View>

        {isPendiente && (
          <View style={styles.cardActions}>
            <AppButton
              title="Rechazar"
              onPress={() => onReject(solicitud)}
              variant="ghost"
              style={{ flex: 1 }}
              icon="close-outline"
              disabled={isProcessing}
            />
            <AppButton
              title={isProcessing ? 'Procesando...' : 'Aceptar'}
              onPress={() => onAccept(solicitud)}
              variant="primary"
              style={{ flex: 1 }}
              icon="check-outline"
              disabled={isProcessing}
            />
          </View>
        )}
      </View>
    </Animated.View>
  );
});

export default function AdminSolicitudesScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const loadSolicitudes = useCallback(async () => {
    try {
      setError(null);
      const response = await requestService.listRequests();
      setSolicitudes(response.data || []);
    } catch (err) {
      console.error('Error loading solicitudes:', err);
      setError(err.message || 'Error al cargar solicitudes');
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadSolicitudes();
      setIsLoading(false);
    })();
  }, [loadSolicitudes]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSolicitudes();
    setRefreshing(false);
  }, [loadSolicitudes]);

  const handleAccept = useCallback((solicitud) => {
    Alert.alert('Aceptar solicitud', '¿Deseas aceptar esta solicitud?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aceptar',
        onPress: async () => {
          setProcessingId(solicitud.uuid);
          try {
            const res = await requestService.aceptarSolicitud(solicitud.uuid);
            if (res.success) {
              Alert.alert('Solicitud aceptada', 'La solicitud fue aceptada correctamente.');
              await loadSolicitudes();
            } else {
              Alert.alert('Error', res.message || 'No fue posible procesar la solicitud.');
            }
          } catch (err) {
            Alert.alert('Error', err.message || 'No fue posible procesar la solicitud.');
          } finally {
            setProcessingId(null);
          }
        },
      },
    ]);
  }, [loadSolicitudes]);

  const handleReject = useCallback((solicitud) => {
    Alert.alert('Rechazar solicitud', '¿Deseas rechazar esta solicitud?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Rechazar',
        style: 'destructive',
        onPress: async () => {
          setProcessingId(solicitud.uuid);
          try {
            const res = await requestService.rechazarSolicitud(solicitud.uuid);
            if (res.success) {
              Alert.alert('Solicitud rechazada', 'La solicitud fue rechazada correctamente.');
              await loadSolicitudes();
            } else {
              Alert.alert('Error', res.message || 'No fue posible procesar la solicitud.');
            }
          } catch (err) {
            Alert.alert('Error', err.message || 'No fue posible procesar la solicitud.');
          } finally {
            setProcessingId(null);
          }
        },
      },
    ]);
  }, [loadSolicitudes]);

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Solicitudes</Text>
          <Text style={styles.headerSubtitle}>Cargando...</Text>
        </View>
        <View style={styles.skeletonWrap}>
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} style={{ marginBottom: 12 }} />
          ))}
        </View>
      </View>
    );
  }

  if (error && solicitudes.length === 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Solicitudes</Text>
          <Text style={styles.headerSubtitle}>Error al cargar</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.error + '15' }]}>
            <Icon source="alert-circle-outline" size={48} color={colors.error} />
          </View>
          <Text style={styles.emptyTitle}>Error al cargar solicitudes</Text>
          <Text style={styles.emptyDesc}>{error}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={loadSolicitudes}
            style={[styles.emptyBtn, { backgroundColor: colors.accent }]}
          >
            <Icon source="refresh" size={18} color={colors.white} />
            <Text style={styles.emptyBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} tintColor={colors.accent} />}
      >
        <AnimatedSection delay={0}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Solicitudes</Text>
            <Text style={styles.headerSubtitle}>Gestiona las solicitudes de alquiler de tus clientes.</Text>
          </View>
        </AnimatedSection>

        {solicitudes.length === 0 ? (
          <AnimatedSection delay={100}>
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconWrap, { backgroundColor: colors.gray50 }]}>
                <Icon source="clipboard-text-outline" size={48} color={colors.gray300} />
              </View>
              <Text style={styles.emptyTitle}>No hay solicitudes</Text>
              <Text style={styles.emptyDesc}>Cuando los clientes soliciten un servicio, aparecerean aqui.</Text>
            </View>
          </AnimatedSection>
        ) : (
          solicitudes.map((solicitud, index) => (
            <SolicitudCard
              key={solicitud.uuid || solicitud.id || index}
              solicitud={solicitud}
              index={index}
              onAccept={handleAccept}
              onReject={handleReject}
              processingId={processingId}
            />
          ))
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  scrollContent: { paddingBottom: 32 },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 4 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 26, color: colors.blue900, letterSpacing: -0.4, marginBottom: 4 },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray600 },
  skeletonWrap: { paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  cardMargin: { marginHorizontal: 20, marginBottom: 12 },
  card: { borderRadius: radii.lg, padding: 16, ...shadows.sm },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardClient: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.blue900 },
  cardCode: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray400, marginTop: 1 },
  cardBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: radii.full },
  cardBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  cardDetails: { gap: 6, marginBottom: 12 },
  cardDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardDetailText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray600 },
  cardActions: { flexDirection: 'row', gap: 10 },
  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32, gap: 12 },
  emptyIconWrap: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.blue900, textAlign: 'center' },
  emptyDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray600, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 13, paddingHorizontal: 24, borderRadius: radii.full, marginTop: 8 },
  emptyBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.white },
});
