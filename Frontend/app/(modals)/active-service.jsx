import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform, Alert, ActivityIndicator } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { formatCurrency } from '../../src/utils/formatters';
import { colors, radii, shadows } from '../../src/theme';
import { requestService } from '../../src/services/request.service';
import endpoints from '../../src/api/endpoints';
import storage from '../../src/storage';
import AppButton from '../../src/components/ui/AppButton';

const HELP_OPTIONS = [
  { key: 'report', label: 'Reportar inconveniente', icon: 'alert-circle-outline', color: colors.error },
  { key: 'call', label: 'Llamar a la empresa', icon: 'phone-outline', color: colors.accent },
  { key: 'message', label: 'Enviar mensaje', icon: 'message-outline', color: colors.blue700 },
  { key: 'instructions', label: 'Instrucciones de uso', icon: 'book-open-variant', color: colors.blue500 },
];

export default function ActiveServiceScreen() {
  const router = useRouter();
  const { serviceId } = useLocalSearchParams();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serviceData, setServiceData] = useState(null);
  const [cronData, setCronData] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const loadServiceData = useCallback(async () => {
    if (!serviceId) return;
    try {
      setError(null);
      const [serviceRes, cronRes] = await Promise.all([
        requestService.getMisServicioDetail(serviceId),
        requestService.getCronometro(serviceId),
      ]);
      setServiceData(serviceRes.data);
      if (cronRes.data) {
        setCronData(cronRes.data);
        if (cronRes.data.activo) {
          setElapsedSeconds((cronRes.data.minutosTranscurridos || 0) * 60);
          setIsPaused(false);
        }
      }
    } catch (err) {
      console.error('Error loading active service:', err);
      setError(err.message || 'Error al cargar el servicio');
    }
  }, [serviceId]);

  useEffect(() => {
    (async () => {
      await loadServiceData();
      setIsLoading(false);
    })();
  }, [loadServiceData]);

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  useEffect(() => {
    if (!serviceId || !serviceData?.alquiler?.uuid) return;
    let ws = null;
    let cancelled = false;

    const connectWs = async () => {
      const token = await storage.getAccessToken();
      if (!token || cancelled) return;

      const wsUrl = `${endpoints.ws.cronometro(serviceData.alquiler.uuid)}?token=${token}`;
      try {
        ws = new WebSocket(wsUrl);
      } catch {
        return;
      }

      ws.onmessage = (event) => {
        if (cancelled) return;
        try {
          const data = JSON.parse(event.data);
          if (data.error) return;
          setElapsedSeconds((data.minutos_transcurridos || 0) * 60);
          setCronData({
            activo: data.activo,
            minutosTranscurridos: data.minutos_transcurridos,
            minutosFacturables: data.minutos_facturables,
            valorAcumulado: data.valor_acumulado,
          });
          if (!data.activo) setIsPaused(true);
        } catch {}
      };

      ws.onerror = () => {};
      ws.onclose = () => {};
    };

    connectWs();

    return () => {
      cancelled = true;
      if (ws) {
        try { ws.close(); } catch {}
      }
    };
  }, [serviceId, serviceData?.alquiler?.uuid]);

  const pricePerHour = cronData?.valorAcumulado && elapsedSeconds > 0
    ? Math.round((cronData.valorAcumulado / (elapsedSeconds / 3600)))
    : 4000;
  const billableMinutes = Math.ceil(elapsedSeconds / 60);
  const accumulatedValue = (billableMinutes / 60) * pricePerHour;

  const formatElapsed = useCallback((totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }, []);

  const handleHelpOption = useCallback((key) => {
    switch (key) {
      case 'report':
        router.push('/(modals)/report-problem');
        break;
      case 'call':
        Alert.alert('Llamar empresa', `Deseas llamar a ${serviceData?.empresa?.nombre || 'la empresa'}?`, [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Llamar' },
        ]);
        break;
      case 'message':
        Alert.alert('Proximamente', 'El envio de mensajes estara disponible pronto.');
        break;
      case 'instructions':
        Alert.alert('Instrucciones de uso', 'Carga frontal: No sobrecargar. Agregar detergente en el compartimento designado. Seleccionar ciclo segun tipo de prenda.');
        break;
    }
  }, [router, serviceData]);

  const handleRequestFinish = useCallback(() => {
    Alert.alert(
      'Solicitar finalizacion',
      'La empresa asignara un repartidor para recoger la lavadora. El servicio no finalizara hasta que la lavadora sea recogida.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Solicitar',
          onPress: () => {
            Alert.alert('Solicitud enviada', 'La empresa ha sido notificada. Un repartidor se dirigira a tu ubicacion.');
          },
        },
      ]
    );
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={[styles.header, { backgroundColor: colors.white }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={handleBack} style={styles.headerBack}>
              <Icon source="arrow-left" size={22} color={colors.blue900} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mi servicio activo</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ marginTop: 12, color: colors.gray600 }}>Cargando servicio...</Text>
        </View>
      </View>
    );
  }

  if (error || !serviceData) {
    return (
      <View style={styles.screen}>
        <View style={[styles.header, { backgroundColor: colors.white }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={handleBack} style={styles.headerBack}>
              <Icon source="arrow-left" size={22} color={colors.blue900} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mi servicio activo</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <Icon source="alert-circle-outline" size={48} color={colors.error} />
          <Text style={{ marginTop: 12, color: colors.gray600, textAlign: 'center' }}>{error || 'No se encontro el servicio'}</Text>
          <AppButton title="Reintentar" onPress={loadServiceData} variant="outline" style={{ marginTop: 16 }} icon="refresh" />
        </View>
      </View>
    );
  }

  const company = serviceData.empresa || {};
  const lav = serviceData.alquiler?.lavadora || {};
  const rep = serviceData.alquiler?.repartidor || serviceData.repartidorNombre ? serviceData : null;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleBack} style={styles.headerBack}>
            <Icon source="arrow-left" size={22} color={colors.blue900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi servicio activo</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* SERVICE INFO */}
          <View style={[styles.section, { backgroundColor: colors.white }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.statusDot, { backgroundColor: colors.accent }]} />
              <Text style={styles.sectionTitle}>Informacion del servicio</Text>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Empresa</Text>
                <Text style={styles.infoValue}>{company.nombre || ''}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Codigo</Text>
                <Text style={[styles.infoValue, styles.infoCode]}>{serviceData.serviceCode}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Estado</Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.accentTint }]}>
                  <Icon source="circle" size={8} color={colors.accent} />
                  <Text style={[styles.statusBadgeText, { color: colors.accent }]}>{serviceData.estadoNombre || serviceData.status}</Text>
                </View>
              </View>
              {serviceData.fechaInicio ? (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Fecha inicio</Text>
                  <Text style={styles.infoValue}>{new Date(serviceData.fechaInicio).toLocaleDateString('es-CO')}</Text>
                </View>
              ) : null}
              {serviceData.fechaProgramada ? (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Programada</Text>
                  <Text style={styles.infoValue}>{new Date(serviceData.fechaProgramada).toLocaleString('es-CO')}</Text>
                </View>
              ) : null}
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Direccion</Text>
                <Text style={styles.infoValue} numberOfLines={2}>{serviceData.direccion}</Text>
              </View>
            </View>
          </View>

          {/* WASHING MACHINE */}
          <View style={[styles.section, { backgroundColor: colors.white }]}>
            <View style={styles.sectionHeader}>
              <Icon source="washing-machine" size={20} color={colors.accent} />
              <Text style={styles.sectionTitle}>Mi lavadora</Text>
            </View>

            <View style={styles.washerCard}>
              <View style={styles.washerTop}>
                <View style={[styles.washerIconWrap, { backgroundColor: colors.accentTint }]}>
                  <Icon source="washing-machine" size={32} color={colors.accent} />
                </View>
                <View style={styles.washerInfo}>
                  <Text style={styles.washerBrand}>{serviceData.lavadoraMarca || lav.marca || ''}</Text>
                  <Text style={styles.washerModel}>{serviceData.lavadoraModelo || lav.modelo || ''}</Text>
                </View>
              </View>

              <View style={styles.washerDivider} />

              <View style={styles.washerDetails}>
                <View style={styles.washerDetailItem}>
                  <Icon source="weight" size={16} color={colors.gray400} />
                  <Text style={styles.washerDetailLabel}>Capacidad</Text>
                  <Text style={styles.washerDetailValue}>{serviceData.lavadoraCapacidad || lav.capacidad || ''}</Text>
                </View>
                {lav.codigo_interno ? (
                  <View style={styles.washerDetailItem}>
                    <Icon source="barcode" size={16} color={colors.gray400} />
                    <Text style={styles.washerDetailLabel}>Codigo interno</Text>
                    <Text style={styles.washerDetailValue}>{lav.codigo_interno}</Text>
                  </View>
                ) : null}
                {lav.estado ? (
                  <View style={styles.washerDetailItem}>
                    <Icon source="check-circle" size={16} color={colors.accent} />
                    <Text style={styles.washerDetailLabel}>Estado</Text>
                    <Text style={[styles.washerDetailValue, { color: colors.accent }]}>{lav.estado}</Text>
                  </View>
                ) : null}
                <View style={styles.washerDetailItem}>
                  <Icon source="domain" size={16} color={colors.gray400} />
                  <Text style={styles.washerDetailLabel}>Empresa</Text>
                  <Text style={styles.washerDetailValue}>{company.nombre || ''}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* CHRONOMETER */}
          <View style={[styles.section, { backgroundColor: colors.white }]}>
            <View style={styles.sectionHeader}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <View style={[styles.chronoDot, { backgroundColor: isPaused ? colors.warning : colors.accent }]} />
              </Animated.View>
              <Text style={styles.sectionTitle}>Cronometro</Text>
              <TouchableOpacity
                onPress={() => setIsPaused(!isPaused)}
                style={[styles.pauseBtn, { backgroundColor: isPaused ? colors.warning + '20' : colors.accentTint }]}
              >
                <Icon source={isPaused ? 'play' : 'pause'} size={16} color={isPaused ? colors.warning : colors.accent} />
              </TouchableOpacity>
            </View>

            <View style={styles.chronoCard}>
              <View style={styles.chronoMain}>
                <Text style={styles.chronoTime}>{formatElapsed(elapsedSeconds)}</Text>
                <Text style={styles.chronoLabel}>Tiempo transcurrido</Text>
              </View>

              <View style={styles.chronoDivider} />

              <View style={styles.chronoStats}>
                <View style={styles.chronoStatItem}>
                  <Text style={styles.chronoStatValue}>{billableMinutes} min</Text>
                  <Text style={styles.chronoStatLabel}>Tiempo facturable</Text>
                </View>
                <View style={[styles.chronoStatDivider, { backgroundColor: colors.gray100 }]} />
                <View style={styles.chronoStatItem}>
                  <Text style={[styles.chronoStatValue, { color: colors.accent }]}>{formatCurrency(accumulatedValue)}</Text>
                  <Text style={styles.chronoStatLabel}>Valor acumulado</Text>
                </View>
              </View>

              <View style={[styles.chronoNote, { backgroundColor: colors.gray50 }]}>
                <Icon source="information-outline" size={14} color={colors.gray400} />
                <Text style={styles.chronoNoteText}>Tarifa: {formatCurrency(pricePerHour)}/hora</Text>
              </View>
            </View>
          </View>

          {/* HELP CENTER */}
          <View style={[styles.section, { backgroundColor: colors.white }]}>
            <View style={styles.sectionHeader}>
              <Icon source="help-circle-outline" size={20} color={colors.blue700} />
              <Text style={styles.sectionTitle}>Centro de ayuda</Text>
            </View>

            <View style={styles.helpList}>
              {HELP_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  activeOpacity={0.7}
                  onPress={() => handleHelpOption(opt.key)}
                  style={[styles.helpItem, { backgroundColor: colors.gray50 }]}
                >
                  <View style={[styles.helpIconWrap, { backgroundColor: opt.color + '15' }]}>
                    <Icon source={opt.icon} size={20} color={opt.color} />
                  </View>
                  <Text style={styles.helpLabel}>{opt.label}</Text>
                  <Icon source="chevron-right" size={18} color={colors.gray400} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* DELIVERY PERSON */}
          {(serviceData.repartidorNombre || rep?.repartidorNombre) ? (
            <View style={[styles.section, { backgroundColor: colors.white }]}>
              <View style={styles.sectionHeader}>
                <Icon source="truck-delivery-outline" size={20} color={colors.blue700} />
                <Text style={styles.sectionTitle}>Repartidor asignado</Text>
              </View>

              <View style={styles.deliveryCard}>
                <View style={[styles.deliveryAvatar, { backgroundColor: colors.blue100 }]}>
                  <Icon source="account" size={28} color={colors.blue700} />
                </View>
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryName}>{serviceData.repartidorNombre || rep?.repartidorNombre || ''}</Text>
                  <Text style={styles.deliveryPhone}>{serviceData.repartidorTelefono || rep?.repartidorTelefono || ''}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => Alert.alert('Llamar repartidor', `Deseas llamar a ${serviceData.repartidorNombre || ''}?`, [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Llamar' },
                  ])}
                  style={[styles.deliveryCallBtn, { backgroundColor: colors.accentTint }]}
                >
                  <Icon source="phone" size={20} color={colors.accent} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* REQUEST FINISH */}
          <View style={styles.finishSection}>
            <AppButton
              title="Solicitar finalizacion"
              onPress={handleRequestFinish}
              variant="outline"
              fullWidth
              icon="logout"
            />
            <Text style={styles.finishNote}>
              La empresa asignara un repartidor para recoger la lavadora.
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 20, paddingHorizontal: 16, paddingBottom: 12, ...shadows.sm },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerBack: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: colors.blue900 },

  scroll: { flex: 1 },
  scrollContent: { paddingTop: 12, paddingBottom: 40 },

  section: { marginHorizontal: 16, marginBottom: 12, borderRadius: radii.md, padding: 16, ...shadows.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: colors.blue900, flex: 1 },

  statusDot: { width: 8, height: 8, borderRadius: 4 },

  infoGrid: { gap: 10 },
  infoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600 },
  infoValue: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.blue900 },
  infoCode: { fontFamily: 'Inter_500Medium', fontSize: 12, backgroundColor: colors.gray50, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.sm },

  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.full },
  statusBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },

  washerCard: { borderWidth: 1, borderColor: colors.gray100, borderRadius: radii.md, padding: 14 },
  washerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  washerIconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  washerInfo: { flex: 1 },
  washerBrand: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.blue900 },
  washerModel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600, marginTop: 2 },
  washerDivider: { height: 1, backgroundColor: colors.gray100, marginVertical: 12 },
  washerDetails: { gap: 8 },
  washerDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  washerDetailLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600, flex: 1 },
  washerDetailValue: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.blue900 },
  washerTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  washerTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full },
  washerTagText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },

  chronoDot: { width: 10, height: 10, borderRadius: 5 },
  pauseBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  chronoCard: { borderWidth: 1, borderColor: colors.gray100, borderRadius: radii.md, overflow: 'hidden' },
  chronoMain: { alignItems: 'center', paddingVertical: 20, backgroundColor: colors.gray50 },
  chronoTime: { fontFamily: 'Poppins_700Bold', fontSize: 40, color: colors.blue900, letterSpacing: 2 },
  chronoLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600, marginTop: 4 },
  chronoDivider: { height: 1, backgroundColor: colors.gray100 },
  chronoStats: { flexDirection: 'row', paddingVertical: 14 },
  chronoStatItem: { flex: 1, alignItems: 'center', gap: 4 },
  chronoStatValue: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.blue900 },
  chronoStatLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray400 },
  chronoStatDivider: { width: 1, marginVertical: 4 },
  chronoNote: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10 },
  chronoNoteText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray600 },

  helpList: { gap: 8 },
  helpItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radii.sm },
  helpIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  helpLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.blue900, flex: 1 },

  deliveryCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.gray100, borderRadius: radii.md, padding: 14 },
  deliveryAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  deliveryInfo: { flex: 1 },
  deliveryName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.blue900 },
  deliveryPhone: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600, marginTop: 2 },
  deliveryStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  deliveryStatusDot: { width: 6, height: 6, borderRadius: 3 },
  deliveryStatusText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  deliveryCallBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  finishSection: { marginHorizontal: 16, marginTop: 4, alignItems: 'center' },
  finishNote: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray400, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
});
