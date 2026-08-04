import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Alert, Platform, ActivityIndicator } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, AnimatedRegion, MarkerAnimated } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { routesService } from '../../src/services/routes.service';
import { colors, radii, shadows } from '../../src/theme';

const GOOGLE_MAPS_APIKEY = Constants.expoConfig?.extra?.googleMapsApiKey || '';
const LOCATION_INTERVAL = 5000;
const GPS_STATES = { ACTIVE: 'active', SEARCHING: 'searching', NONE: 'none' };

export default function DriverNavigationScreen() {
  const router = useRouter();
  const { routeUuid, uuid } = useLocalSearchParams();
  const routeId = routeUuid || uuid;
  const [routeData, setRouteData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);
  const [error, setError] = useState(null);
  const [region, setRegion] = useState({
    latitude: 4.6097,
    longitude: -74.0817,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [googleRoute, setGoogleRoute] = useState({ distance: null, duration: null });
  const [gpsState, setGpsState] = useState(GPS_STATES.NONE);
  const [heading, setHeading] = useState(0);
  const [autoFollow, setAutoFollow] = useState(true);
  const mapRef = useRef(null);
  const driverAnimRegion = useRef(
    new AnimatedRegion({
      latitude: 4.6097,
      longitude: -74.0817,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  ).current;
  const locationSubRef = useRef(null);
  const wsCleanupRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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

  const origin = useMemo(() => {
    if (routeData?.latitud_actual && routeData?.longitud_actual) {
      return { latitude: routeData.latitud_actual, longitude: routeData.longitud_actual };
    }
    return null;
  }, [routeData?.latitud_actual, routeData?.longitud_actual]);

  const destination = useMemo(() => {
    if (routeData?.latitud_destino && routeData?.longitud_destino) {
      return { latitude: routeData.latitud_destino, longitude: routeData.longitud_destino };
    }
    if (routeData?.latitud_cliente && routeData?.longitud_cliente) {
      return { latitude: routeData.latitud_cliente, longitude: routeData.longitud_cliente };
    }
    return null;
  }, [routeData?.latitud_destino, routeData?.longitud_destino, routeData?.latitud_cliente, routeData?.longitud_cliente]);

  const handleDirectionsReady = useCallback((result) => {
    setGoogleRoute({ distance: result.distance, duration: result.duration });
    if (mapRef.current && origin && destination) {
      const coords = [
        origin,
        ...(result.coordinates || []),
        destination,
      ];
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 80, right: 60, bottom: 320, left: 60 },
        animated: true,
      });
    }
  }, [origin, destination]);

  const displayDistance = useMemo(() => {
    if (googleRoute.distance) return googleRoute.distance * 1000;
    return routeData?.distancia_restante_metros;
  }, [googleRoute.distance, routeData?.distancia_restante_metros]);

  const displayDuration = useMemo(() => {
    if (googleRoute.duration) return googleRoute.duration * 60;
    return routeData?.tiempo_estimado_segundos;
  }, [googleRoute.duration, routeData?.tiempo_estimado_segundos]);

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
          const initCoord = {
            latitude: response.data.latitud_actual,
            longitude: response.data.longitud_actual,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setRegion(initCoord);
          driverAnimRegion.setValue(initCoord);
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

  const startLocationTracking = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la ubicacion para rastrear la ruta.');
      return;
    }

    setGpsState(GPS_STATES.SEARCHING);

    const gpsTimeout = setTimeout(() => {
      setGpsState((prev) => prev === GPS_STATES.ACTIVE ? prev : GPS_STATES.NONE);
    }, 10000);

    locationSubRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: LOCATION_INTERVAL,
        distanceInterval: 5,
      },
      async (location) => {
        if (!routeData?.uuid) return;
        setGpsState(GPS_STATES.ACTIVE);
        const newLat = location.coords.latitude;
        const newLng = location.coords.longitude;
        const newHeading = location.coords.heading || 0;
        setHeading(newHeading);

        try {
          await routesService.updateLocation(routeData.uuid, {
            latitud: newLat,
            longitud: newLng,
            precision: location.coords.accuracy,
            heading: newHeading,
            velocidad: location.coords.speed ? location.coords.speed * 3.6 : 0,
            timestamp: new Date(location.timestamp).toISOString(),
          });
        } catch {}

        const newCoord = { latitude: newLat, longitude: newLng };
        driverAnimRegion.timing({ ...newCoord, latitudeDelta: 0.01, longitudeDelta: 0.01 }, { duration: 800 }).start();

        setRegion((prev) => ({ ...prev, ...newCoord }));
        if (autoFollow && mapRef.current) {
          mapRef.current.animateToRegion({ ...newCoord, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 800);
        }
      }
    );

    return () => {
      clearTimeout(gpsTimeout);
      if (locationSubRef.current) {
        locationSubRef.current.remove();
        locationSubRef.current = null;
      }
    };
  }, [routeData?.uuid, autoFollow]);

  const recenterMap = useCallback(() => {
    if (mapRef.current && origin) {
      setAutoFollow(true);
      mapRef.current.animateToRegion({ ...origin, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 600);
    }
  }, [origin]);


  const stopLocationTracking = useCallback(() => {
    if (locationSubRef.current) {
      locationSubRef.current.remove();
      locationSubRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopLocationTracking();
  }, [stopLocationTracking]);

  useEffect(() => {
    if (!routeData?.uuid || routeData?.estado !== 'EN_CURSO') return;

    wsCleanupRef.current = routesService.connect(
      routeData.uuid,
      (data) => {
        setRouteData((prev) => ({ ...prev, ...data }));
      },
      (err) => setError(err),
    );

    return () => {
      if (wsCleanupRef.current) wsCleanupRef.current();
    };
  }, [routeData?.uuid, routeData?.estado]);

  const handleStart = useCallback(async () => {
    if (!routeData?.uuid) return;
    setIsStarting(true);
    try {
      const res = await routesService.startRoute(routeData.uuid);
      if (res.success) {
        setRouteData((prev) => ({ ...prev, estado: 'EN_CURSO', fecha_inicio: new Date().toISOString() }));
        await startLocationTracking();
      } else {
        Alert.alert('Error', res.message || 'No se pudo iniciar la ruta');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Error al iniciar ruta');
    } finally {
      setIsStarting(false);
    }
  }, [routeData?.uuid, startLocationTracking]);

  const handleFinish = useCallback(async () => {
    if (!routeData?.uuid) return;
    Alert.alert('Finalizar ruta', 'Esto finalizara el seguimiento GPS. Confirmar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Finalizar',
        onPress: async () => {
          setIsFinishing(true);
          try {
            stopLocationTracking();
            const res = await routesService.finishRoute(routeData.uuid);
            if (res.success) {
              setRouteData((prev) => ({ ...prev, estado: 'FINALIZADA', fecha_fin: new Date().toISOString() }));
              Alert.alert('Ruta finalizada', 'El seguimiento GPS ha sido finalizado.');
            } else {
              Alert.alert('Error', res.message || 'No se pudo finalizar');
            }
          } catch (err) {
            Alert.alert('Error', err.message || 'Error al finalizar');
          } finally {
            setIsFinishing(false);
          }
        },
      },
    ]);
  }, [routeData?.uuid, stopLocationTracking]);

  const handleDeliver = useCallback(async () => {
    if (!routeData?.uuid) return;
    Alert.alert('Confirmar entrega', '¿Confirmar que la lavadora fue entregada al cliente?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          setIsDelivering(true);
          try {
            const res = await routesService.deliverRoute(routeData.uuid);
            if (res.success) {
              await loadRoute();
              Alert.alert('Entrega registrada', 'La lavadora fue entregada correctamente.');
            } else {
              Alert.alert('Error', res.message || 'No se pudo registrar la entrega');
            }
          } catch (err) {
            Alert.alert('Error', err.message || 'Error al entregar');
          } finally {
            setIsDelivering(false);
          }
        },
      },
    ]);
  }, [routeData?.uuid, loadRoute]);

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon source="arrow-left" size={24} color={colors.blue900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Navegacion</Text>
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
          <Text style={styles.headerTitle}>Navegacion</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.error + '15' }]}>
            <Icon source="map-marker-off" size={48} color={colors.error} />
          </View>
          <Text style={styles.emptyTitle}>Sin ruta asignada</Text>
          <Text style={styles.emptyDesc}>{error || 'No hay ruta de navegacion disponible.'}</Text>
          <TouchableOpacity onPress={loadRoute} style={[styles.emptyBtn, { backgroundColor: colors.accent }]}>
            <Text style={styles.emptyBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isEnCurso = routeData?.estado === 'EN_CURSO';
  const isPendiente = routeData?.estado === 'PENDIENTE';
  const isFinalizada = routeData?.estado === 'FINALIZADA';
  const showDirections = isEnCurso && origin && destination && !!GOOGLE_MAPS_APIKEY;

  const gpsColor = gpsState === GPS_STATES.ACTIVE ? colors.accent : gpsState === GPS_STATES.SEARCHING ? '#FFC107' : colors.error;
  const gpsLabel = gpsState === GPS_STATES.ACTIVE ? 'GPS activo' : gpsState === GPS_STATES.SEARCHING ? 'Buscando senal' : 'Sin senal';

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon source="arrow-left" size={24} color={colors.blue900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Navegacion GPS</Text>
        <View style={[styles.statusDot, { backgroundColor: isEnCurso ? colors.accent : isFinalizada ? colors.gray400 : colors.warning }]} />
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={region}
          showsUserLocation={false}
          showsMyLocationButton={false}
          onPanDrag={() => setAutoFollow(false)}
        >
          {origin && (
            <MarkerAnimated
              coordinate={driverAnimRegion}
              title="Tu ubicacion"
              style={{ transform: [{ rotate: `${heading}deg` }] }}
            >
              <View style={[styles.markerDriver, { backgroundColor: colors.accent }]}>
                <Icon source="truck-delivery" size={18} color={colors.white} />
              </View>
            </MarkerAnimated>
          )}
          {routeData?.latitud_cliente && routeData?.longitud_cliente && (
            <Marker coordinate={{ latitude: routeData.latitud_cliente, longitude: routeData.longitud_cliente }} title="Cliente">
              <View style={[styles.markerClient, { backgroundColor: colors.blue900 }]}>
                <Icon source="account" size={16} color={colors.white} />
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
          {showDirections && (
            <MapViewDirections
              origin={origin}
              destination={destination}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeColor={colors.accent}
              strokeWidth={4}
              onReady={handleDirectionsReady}
              onError={(err) => console.warn('Directions error:', err)}
              resetOnChange={false}
              optimizeWaypoints={true}
            />
          )}
          {!showDirections && origin && destination && (
            <Polyline coordinates={[origin, destination]} strokeColor={colors.accent} strokeWidth={4} />
          )}
        </MapView>

        <View style={styles.gpsIndicator}>
          <View style={[styles.gpsDot, { backgroundColor: gpsColor }]} />
          <Text style={styles.gpsLabel}>{gpsLabel}</Text>
        </View>

        {isEnCurso && (
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: autoFollow ? colors.accent : colors.white }]}
            onPress={recenterMap}
          >
            <Icon source="crosshairs-gps" size={22} color={autoFollow ? colors.white : colors.blue900} />
          </TouchableOpacity>
        )}
      </View>

      <Animated.View style={[styles.infoPanel, { backgroundColor: colors.white }, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.panelHandle} />

        <View style={styles.infoGrid}>
          <View style={[styles.infoCard, { backgroundColor: colors.accentTint }]}>
            <Icon source="map-marker-distance" size={20} color={colors.accent} />
            <Text style={styles.infoCardValue}>{formatDistance(displayDistance)}</Text>
            <Text style={styles.infoCardLabel}>Distancia</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: colors.blue100 }]}>
            <Icon source="clock-outline" size={20} color={colors.blue700} />
            <Text style={styles.infoCardValue}>{formatTime(displayDuration)}</Text>
            <Text style={styles.infoCardLabel}>Tiempo est.</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          {isPendiente && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.accent, opacity: isStarting ? 0.6 : 1 }]}
              onPress={handleStart}
              disabled={isStarting}
            >
              {isStarting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Icon source="play" size={20} color={colors.white} />
                  <Text style={styles.actionBtnText}>Iniciar ruta</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          {isEnCurso && routeData?.alquiler_estado === 'CAMINO' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.accent, opacity: isDelivering ? 0.6 : 1 }]}
              onPress={handleDeliver}
              disabled={isDelivering}
            >
              {isDelivering ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Icon source="check-circle-outline" size={20} color={colors.white} />
                  <Text style={styles.actionBtnText}>Entregar lavadora</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          {isEnCurso && routeData?.alquiler_estado === 'ACTIVO' && (
            <>
              <View style={[styles.actionBtn, { backgroundColor: colors.success || '#4CAF50' }]}>
                <Icon source="check-circle" size={20} color={colors.white} />
                <Text style={styles.actionBtnText}>Lavadora entregada</Text>
              </View>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.error, opacity: isFinishing ? 0.6 : 1 }]}
                onPress={handleFinish}
                disabled={isFinishing}
              >
                {isFinishing ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Icon source="stop" size={20} color={colors.white} />
                    <Text style={styles.actionBtnText}>Finalizar ruta</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
          {isEnCurso && !routeData?.alquiler_estado && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.error, opacity: isFinishing ? 0.6 : 1 }]}
              onPress={handleFinish}
              disabled={isFinishing}
            >
              {isFinishing ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Icon source="stop" size={20} color={colors.white} />
                  <Text style={styles.actionBtnText}>Finalizar ruta</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          {isFinalizada && (
            <View style={[styles.actionBtn, { backgroundColor: colors.gray300 }]}>
              <Icon source="check-circle" size={20} color={colors.white} />
              <Text style={styles.actionBtnText}>Ruta finalizada</Text>
            </View>
          )}
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
  gpsIndicator: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 6, ...shadows.sm },
  gpsDot: { width: 8, height: 8, borderRadius: 4 },
  gpsLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.gray700 },
  fab: { position: 'absolute', bottom: 16, right: 16, width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', ...shadows.md },
  markerDriver: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: colors.white },
  markerClient: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: colors.white },
  markerDest: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: colors.white },
  infoPanel: { borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: 20, paddingBottom: 32, ...shadows.md },
  panelHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.gray200, alignSelf: 'center', marginBottom: 16 },
  infoGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  infoCard: { flex: 1, alignItems: 'center', padding: 14, borderRadius: radii.md, gap: 4 },
  infoCardValue: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: colors.blue900 },
  infoCardLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray500 },
  buttonRow: { gap: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: radii.md },
  actionBtnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: colors.white },
});
