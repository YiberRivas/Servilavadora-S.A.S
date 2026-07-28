import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { routesService } from '../../src/services/routes.service';
import { colors, radii, shadows } from '../../src/theme';

const { width } = Dimensions.get('window');

function StatCard({ icon, label, value, color, bgColor }) {
  return (
    <View style={[styles.statCard, { backgroundColor: bgColor || colors.gray50 }]}>
      <Icon source={icon} size={20} color={color || colors.gray500} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function RouteHistoryScreen() {
  const router = useRouter();
  const { routeUuid, uuid } = useLocalSearchParams();
  const routeId = routeUuid || uuid;
  const [historyData, setHistoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [region, setRegion] = useState({
    latitude: 4.6097,
    longitude: -74.0817,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const mapRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const formatDistance = (meters) => {
    if (!meters) return '0 m';
    if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
    return `${Math.round(meters)} m`;
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0 min';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}min`;
    if (m > 0) return `${m} min ${s}s`;
    return `${s} s`;
  };

  const loadHistory = useCallback(async () => {
    try {
      setError(null);
      const response = await routesService.getHistory(routeId);
      if (response.success) {
        setHistoryData(response.data);
        if (response.data.puntos && response.data.puntos.length > 0) {
          const first = response.data.puntos[0];
          setRegion({
            latitude: first.latitud,
            longitude: first.longitud,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          });
        }
      } else {
        setError(response.message || 'Historial no disponible');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar historial');
    }
  }, [routeId]);

  useEffect(() => {
    (async () => {
      await loadHistory();
      setIsLoading(false);
    })();
  }, [loadHistory]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon source="arrow-left" size={24} color={colors.blue900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historial de ruta</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </View>
    );
  }

  if (error || !historyData) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon source="arrow-left" size={24} color={colors.blue900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historial de ruta</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.error + '15' }]}>
            <Icon source="history" size={48} color={colors.error} />
          </View>
          <Text style={styles.emptyTitle}>Sin historial</Text>
          <Text style={styles.emptyDesc}>{error || 'No hay historial de ruta disponible.'}</Text>
          <TouchableOpacity onPress={loadHistory} style={[styles.emptyBtn, { backgroundColor: colors.accent }]}>
            <Text style={styles.emptyBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const puntos = historyData.puntos || [];
  const polylineCoords = puntos.map((p) => ({ latitude: p.latitud, longitude: p.longitud }));
  const startPoint = polylineCoords.length > 0 ? polylineCoords[0] : null;
  const endPoint = polylineCoords.length > 1 ? polylineCoords[polylineCoords.length - 1] : null;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon source="arrow-left" size={24} color={colors.blue900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de ruta</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={region}
            scrollEnabled={false}
          >
            {polylineCoords.length > 0 && (
              <Polyline coordinates={polylineCoords} strokeColor={colors.accent} strokeWidth={4} />
            )}
            {startPoint && (
              <Marker coordinate={startPoint} title="Inicio">
                <View style={[styles.marker, { backgroundColor: colors.accent }]}>
                  <Icon source="play" size={14} color={colors.white} />
                </View>
              </Marker>
            )}
            {endPoint && (
              <Marker coordinate={endPoint} title="Fin">
                <View style={[styles.marker, { backgroundColor: colors.error }]}>
                  <Icon source="stop" size={14} color={colors.white} />
                </View>
              </Marker>
            )}
          </MapView>
        </View>

        <View style={[styles.statusRow, { backgroundColor: colors.white }]}>
          <View style={[styles.statusBadge, { backgroundColor: historyData.estado === 'FINALIZADA' ? '#10B981' + '15' : colors.gray50 }]}>
            <Icon source={historyData.estado === 'FINALIZADA' ? 'check-circle' : 'clock-outline'} size={16} color={historyData.estado === 'FINALIZADA' ? '#10B981' : colors.gray500} />
            <Text style={[styles.statusText, { color: historyData.estado === 'FINALIZADA' ? '#10B981' : colors.gray500 }]}>{historyData.estado}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard icon="map-marker-distance" label="Distancia" value={formatDistance(historyData.total_distancia_metros)} color={colors.accent} bgColor={colors.accentTint} />
          <StatCard icon="clock-outline" label="Tiempo total" value={formatTime(historyData.tiempo_total_segundos)} color={colors.blue700} bgColor={colors.blue100} />
          <StatCard icon="speedometer" label="Vel. promedio" value={`${historyData.velocidad_promedio_kmh || 0} km/h`} color={colors.gray600} bgColor={colors.gray50} />
          <StatCard icon="map-marker-path" label="Puntos" value={historyData.total_puntos || 0} color={colors.warning} bgColor={colors.warningTint || '#FEF3C7'} />
        </View>

        <View style={[styles.detailCard, { backgroundColor: colors.white }]}>
          <Text style={styles.detailTitle}>Detalles del recorrido</Text>
          <View style={styles.detailRow}>
            <Icon source="calendar-start" size={16} color={colors.gray400} />
            <Text style={styles.detailLabel}>Inicio</Text>
            <Text style={styles.detailValue}>{formatDate(historyData.fecha_inicio)}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Icon source="calendar-end" size={16} color={colors.gray400} />
            <Text style={styles.detailLabel}>Fin</Text>
            <Text style={styles.detailValue}>{formatDate(historyData.fecha_fin)}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Icon source="map-marker-path" size={16} color={colors.gray400} />
            <Text style={styles.detailLabel}>Total puntos GPS</Text>
            <Text style={styles.detailValue}>{historyData.total_puntos || 0}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: colors.white, ...shadows.sm },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: colors.blue900 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 32 },
  mapContainer: { height: 250, marginHorizontal: 16, marginTop: 16, borderRadius: radii.lg, overflow: 'hidden', ...shadows.sm },
  map: { flex: 1 },
  marker: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.white },
  statusRow: { flexDirection: 'row', justifyContent: 'center', marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: radii.md, ...shadows.sm },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  statusText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginHorizontal: 16, marginTop: 12 },
  statCard: { width: (width - 44) / 2, alignItems: 'center', padding: 14, borderRadius: radii.md, gap: 4 },
  statValue: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: colors.blue900 },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray500 },
  detailCard: { marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: radii.lg, ...shadows.sm },
  detailTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: colors.blue900, marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  detailLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray500, flex: 1 },
  detailValue: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.blue900 },
  detailDivider: { height: 1, backgroundColor: colors.gray100 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIconWrap: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.blue900, textAlign: 'center' },
  emptyDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray500, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  emptyBtn: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 999 },
  emptyBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.white },
});
