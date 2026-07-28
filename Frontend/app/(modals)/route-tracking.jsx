import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { routesService } from '../../src/services/routes.service';
import { colors, radii, shadows } from '../../src/theme';

const { width } = Dimensions.get('window');

function InfoRow({ icon, label, value, color }) {
  return (
    <View style={styles.infoRow}>
      <Icon source={icon} size={18} color={color || colors.gray400} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, color ? { color } : null]}>{value || '-'}</Text>
    </View>
  );
}

export default function RouteTrackingScreen() {
  const router = useRouter();
  const { routeUuid, uuid } = useLocalSearchParams();
  const routeId = routeUuid || uuid;
  const [routeData, setRouteData] = useState(null);
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
  const wsCleanupRef = useRef(null);

  const formatDistance = (meters) => {
    if (!meters) return '0 m';
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${Math.round(meters)} m`;
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0 min';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m} min ${s}s`;
    return `${s} s`;
  };

  const formatSpeed = (speed) => {
    if (!speed) return '0 km/h';
    return `${Math.round(speed)} km/h`;
  };

  const loadRoute = useCallback(async () => {
    try {
      setError(null);
      const uuid = routeId || null;
      let response;
      if (uuid) {
        response = await routesService.getRoute(uuid);
      } else {
        response = await routesService.getMyRoute();
      }
      if (response.success) {
        setRouteData(response.data);
        if (response.data.latitud_actual && response.data.longitud_actual) {
          setRegion({
            latitude: response.data.latitud_actual,
            longitude: response.data.longitud_actual,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } else {
        setError(response.message || 'No hay ruta activa');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar ruta');
    }
  }, [routeId]);

  useEffect(() => {
    (async () => {
      await loadRoute();
      setIsLoading(false);
    })();
  }, [loadRoute]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!routeData?.uuid) return;
    wsCleanupRef.current = routesService.connect(
      routeData.uuid,
      (data) => {
        setRouteData((prev) => ({ ...prev, ...data }));
        if (data.latitud_actual && data.longitud_actual) {
          const newRegion = {
            latitude: data.latitud_actual,
            longitude: data.longitud_actual,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setRegion(newRegion);
          if (mapRef.current) {
            mapRef.current.animateToRegion(newRegion, 1000);
          }
        }
      },
      (err) => setError(err),
    );

    return () => {
      if (wsCleanupRef.current) wsCleanupRef.current();
    };
  }, [routeData?.uuid]);

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon source="arrow-left" size={24} color={colors.blue900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Seguimiento</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </View>
    );
  }

  if (error && !routeData) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon source="arrow-left" size={24} color={colors.blue900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Seguimiento</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.error + '15' }]}>
            <Icon source="map-marker-off" size={48} color={colors.error} />
          </View>
          <Text style={styles.emptyTitle}>Sin ruta activa</Text>
          <Text style={styles.emptyDesc}>{error || 'No hay ruta de seguimiento disponible.'}</Text>
          <TouchableOpacity onPress={loadRoute} style={[styles.emptyBtn, { backgroundColor: colors.accent }]}>
            <Text style={styles.emptyBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const driverLocation = routeData?.latitud_actual && routeData?.longitud_actual
    ? { latitude: routeData.latitud_actual, longitude: routeData.longitud_actual }
    : null;

  const clientLocation = routeData?.latitud_cliente && routeData?.longitud_cliente
    ? { latitude: routeData.latitud_cliente, longitude: routeData.longitud_cliente }
    : null;

  const destination = routeData?.latitud_destino && routeData?.longitud_destino
    ? { latitude: routeData.latitud_destino, longitude: routeData.longitud_destino }
    : null;

  const polylineCoords = [];
  if (clientLocation) polylineCoords.push(clientLocation);
  if (driverLocation) polylineCoords.push(driverLocation);

  const statusColor = routeData?.estado === 'EN_CURSO' ? colors.accent
    : routeData?.estado === 'FINALIZADA' ? colors.gray400
    : colors.warning;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon source="arrow-left" size={24} color={colors.blue900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seguimiento en vivo</Text>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={region}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {driverLocation && (
            <Marker coordinate={driverLocation} title="Repartidor">
              <View style={[styles.markerDriver, { backgroundColor: colors.accent }]}>
                <Icon source="truck-delivery" size={18} color={colors.white} />
              </View>
            </Marker>
          )}
          {clientLocation && (
            <Marker coordinate={clientLocation} title="Tu ubicacion">
              <View style={[styles.markerClient, { backgroundColor: colors.blue900 }]}>
                <Icon source="home" size={16} color={colors.white} />
              </View>
            </Marker>
          )}
          {destination && (
            <Marker coordinate={destination} title="Destino">
              <View style={[styles.markerDest, { backgroundColor: colors.warning }]}>
                <Icon source="map-marker" size={16} color={colors.white} />
              </View>
            </Marker>
          )}
          {polylineCoords.length >= 2 && (
            <Polyline coordinates={polylineCoords} strokeColor={colors.accent} strokeWidth={4} />
          )}
        </MapView>
      </View>

      <Animated.View style={[styles.infoPanel, { backgroundColor: colors.white }, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.panelHandle} />

        <View style={styles.statusHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
            <View style={[styles.statusDotSmall, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{routeData?.estado || 'PENDIENTE'}</Text>
          </View>
          {routeData?.repartidor_nombre && (
            <Text style={styles.driverName}>{routeData.repartidor_nombre}</Text>
          )}
        </View>

        <View style={styles.infoGrid}>
          <View style={[styles.infoCard, { backgroundColor: colors.accentTint }]}>
            <Icon source="map-marker-distance" size={20} color={colors.accent} />
            <Text style={styles.infoCardValue}>{formatDistance(routeData?.distancia_restante_metros)}</Text>
            <Text style={styles.infoCardLabel}>Distancia</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: colors.blue100 }]}>
            <Icon source="clock-outline" size={20} color={colors.blue700} />
            <Text style={styles.infoCardValue}>{formatTime(routeData?.tiempo_estimado_segundos)}</Text>
            <Text style={styles.infoCardLabel}>Tiempo est.</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: colors.gray50 }]}>
            <Icon source="speedometer" size={20} color={colors.gray600} />
            <Text style={styles.infoCardValue}>{formatSpeed(routeData?.velocidad)}</Text>
            <Text style={styles.infoCardLabel}>Velocidad</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: colors.white, ...shadows.sm },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: colors.blue900 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIconWrap: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.blue900, textAlign: 'center' },
  emptyDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray500, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  emptyBtn: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 999 },
  emptyBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.white },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  markerDriver: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: colors.white },
  markerClient: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: colors.white },
  markerDest: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: colors.white },
  infoPanel: { borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: 20, paddingBottom: 32, ...shadows.md },
  panelHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.gray200, alignSelf: 'center', marginBottom: 16 },
  statusHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusDotSmall: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  driverName: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: colors.blue900 },
  infoGrid: { flexDirection: 'row', gap: 10 },
  infoCard: { flex: 1, alignItems: 'center', padding: 12, borderRadius: radii.md, gap: 4 },
  infoCardValue: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: colors.blue900 },
  infoCardLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray500 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  infoLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray500, flex: 1 },
  infoValue: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.blue900 },
});
