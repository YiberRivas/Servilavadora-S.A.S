import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform, TextInput, Modal, RefreshControl, Alert } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SERVICE_STATUS_CONFIG } from '../../src/constants';
import { getLogoBg } from '../../src/constants/data/home';
import { formatCurrency, formatMinutes } from '../../src/utils/formatters';
import { colors, radii, shadows } from '../../src/theme';
import { requestService } from '../../src/services/request.service';
import AppButton from '../../src/components/ui/AppButton';
import SkeletonCard from '../../src/components/ui/SkeletonCard';

const FILTER_OPTIONS = [
  { key: 'all', label: 'Todos' },
  { key: 'solicitud_enviada', label: 'Pendientes' },
  { key: 'aceptada', label: 'Aceptados' },
  { key: 'programada', label: 'Programados' },
  { key: 'en_camino', label: 'En Camino' },
  { key: 'lavadora_entregada', label: 'Entregados' },
  { key: 'en_uso', label: 'En Uso' },
  { key: 'finalizacion_solicitada', label: 'Finalizacion' },
  { key: 'cancelado', label: 'Cancelados' },
  { key: 'incidencia', label: 'Incidencias' },
];

const SORT_OPTIONS = [
  { key: 'recent', label: 'Mas recientes' },
  { key: 'oldest', label: 'Mas antiguos' },
  { key: 'company', label: 'Empresa' },
  { key: 'status', label: 'Estado' },
  { key: 'date', label: 'Fecha' },
];

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

function StatusSummaryCard({ icon, count, label, color, bgColor }) {
  return (
    <View style={[styles.summaryCard, { backgroundColor: bgColor }]}>
      <Icon source={icon} size={22} color={color} />
      <Text style={[styles.summaryCount, { color }]}>{count}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const ServiceCard = React.memo(function ServiceCard({ service, index, onViewDetail }) {
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

  const st = SERVICE_STATUS_CONFIG[service.status] || SERVICE_STATUS_CONFIG.pendiente;

  const timelineProgress = useMemo(() => {
    const steps = ['solicitud', 'aceptada', 'programada', 'en_camino', 'lavadora_entregada', 'en_uso'];
    const completed = steps.filter((s) => service.timeline?.[s]).length;
    return { steps, completed };
  }, [service.timeline]);

  const fechaStr = useMemo(() => {
    if (!service.fechaInicio) return '';
    const d = new Date(service.fechaInicio);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }, [service.fechaInicio]);

  const horaStr = useMemo(() => {
    if (!service.fechaInicio) return '';
    const d = new Date(service.fechaInicio);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
  }, [service.fechaInicio]);

  return (
    <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }, styles.cardMargin]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onViewDetail(service)}
        style={[styles.card, { backgroundColor: colors.white }]}
      >
        <View style={styles.cardTop}>
          <View style={[styles.cardLogo, { backgroundColor: getLogoBg(index) }]}>
            <Text style={styles.cardLogoText}>{(service.empresaNombre || 'E').charAt(0)}</Text>
          </View>
          <View style={styles.cardCompanyArea}>
            <View style={styles.cardCompanyRow}>
              <Text style={styles.cardCompany} numberOfLines={1}>{service.empresaNombre}</Text>
            </View>
            <Text style={styles.cardCode}>{service.serviceCode}</Text>
          </View>
          <View style={[styles.cardBadge, { backgroundColor: st.bg }]}>
            <Icon source={st.icon} size={11} color={st.color} />
            <Text style={[styles.cardBadgeText, { color: st.color }]} numberOfLines={1}>{st.label}</Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.cardDetailRow}>
            <Icon source="map-marker-outline" size={13} color={colors.gray400} />
            <Text style={styles.cardDetailText} numberOfLines={1}>{service.direccion}</Text>
          </View>
          <View style={styles.cardDetailRow}>
            <Icon source="washing-machine" size={13} color={colors.gray400} />
            <Text style={styles.cardDetailText}>{service.lavadoraMarca} {service.lavadoraModelo} - {service.capacidad}</Text>
          </View>
          {fechaStr ? (
            <View style={styles.cardDetailRow}>
              <Icon source="calendar-outline" size={13} color={colors.gray400} />
              <Text style={styles.cardDetailText}>{fechaStr} {horaStr}</Text>
            </View>
          ) : null}
          {service.valorTotal > 0 ? (
            <View style={styles.cardDetailRow}>
              <Icon source="cash" size={13} color={colors.gray400} />
              <Text style={styles.cardDetailText}>{formatCurrency(service.valorTotal)}</Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.timelineWrap, { backgroundColor: colors.gray50 }]}>
          {timelineProgress.steps.map((step, i) => {
            const isCompleted = i < timelineProgress.completed;
            const isCurrent = i === timelineProgress.completed - 1;
            return (
              <View key={step} style={styles.timelineStep}>
                <View style={[styles.timelineDot, isCompleted && { backgroundColor: colors.accent, borderColor: colors.accent }, isCurrent && styles.timelineDotCurrent]} />
                {i < timelineProgress.steps.length - 1 && (
                  <View style={[styles.timelineLine, isCompleted && { backgroundColor: colors.accent }]} />
                )}
              </View>
            );
          })}
        </View>

        <AppButton
          title={service.status === 'en_uso' ? 'Abrir Mi Servicio Activo' : 'Ver detalles'}
          onPress={() => onViewDetail(service)}
          variant={service.status === 'en_uso' ? 'primary' : 'outline'}
          fullWidth
          icon={service.status === 'en_uso' ? 'play-circle-outline' : 'eye-outline'}
        />
      </TouchableOpacity>
    </Animated.View>
  );
});

export default function MyServicesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showSort, setShowSort] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);

  const loadServices = useCallback(async () => {
    try {
      setError(null);
      const response = await requestService.listMisServicios();
      setServices(response.data || []);
    } catch (err) {
      console.error('Error loading services:', err);
      setError(err.message || 'Error al cargar servicios');
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadServices();
      setIsLoading(false);
    })();
  }, [loadServices]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  }, [loadServices]);

  const statusCounts = useMemo(() => {
    const counts = { pendientes: 0, en_camino: 0, en_uso: 0, reservados: 0 };
    services.forEach((s) => {
      const st = s.status || '';
      if (['solicitud_enviada', 'pendiente', 'aceptada'].includes(st)) counts.pendientes++;
      else if (st === 'en_camino') counts.en_camino++;
      else if (st === 'en_uso') counts.en_uso++;
      else if (st === 'programada') counts.reservados++;
    });
    return counts;
  }, [services]);

  const filtered = useMemo(() => {
    let result = [...services];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          (s.serviceCode || '').toLowerCase().includes(q) ||
          (s.empresaNombre || '').toLowerCase().includes(q) ||
          (s.direccion || '').toLowerCase().includes(q) ||
          (s.capacidad || '').toLowerCase().includes(q)
      );
    }

    if (activeFilter !== 'all') {
      result = result.filter((s) => s.status === activeFilter);
    }

    switch (sortBy) {
      case 'oldest':
        result = [...result].reverse();
        break;
      case 'company':
        result = [...result].sort((a, b) => (a.empresaNombre || '').localeCompare(b.empresaNombre || ''));
        break;
      case 'status':
        result = [...result].sort((a, b) => (SERVICE_STATUS_CONFIG[a.status]?.priority || 0) - (SERVICE_STATUS_CONFIG[b.status]?.priority || 0));
        break;
      case 'date':
        result = [...result].sort((a, b) => (a.fechaInicio || '').localeCompare(b.fechaInicio || ''));
        break;
      default:
        break;
    }

    return result;
  }, [searchQuery, activeFilter, sortBy, services]);

  const handleViewDetail = useCallback((service) => {
    setSelectedService(service);
    setShowDetail(true);
  }, []);

  const handleCancelService = useCallback(() => {
    setShowCancelModal(false);
    setShowDetail(false);
    Alert.alert('Servicio cancelado', 'Tu solicitud ha sido cancelada exitosamente.');
  }, []);

  const handleNavigateActive = useCallback(() => {
    setShowDetail(false);
    if (selectedService?.uuid) {
      router.push({ pathname: '/(modals)/active-service', params: { serviceId: selectedService.uuid } });
    }
  }, [router, selectedService]);

  const handleNavigateCompany = useCallback(() => {
    setShowDetail(false);
    if (selectedService?.empresaUuid) {
      router.push({ pathname: '/(modals)/company-detail', params: { id: selectedService.empresaUuid } });
    }
  }, [router, selectedService]);

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mis Servicios</Text>
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

  if (error && services.length === 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mis Servicios</Text>
          <Text style={styles.headerSubtitle}>Error al cargar</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.error + '15' }]}>
            <Icon source="alert-circle-outline" size={48} color={colors.error} />
          </View>
          <Text style={styles.emptyTitle}>Error al cargar servicios</Text>
          <Text style={styles.emptyDesc}>{error}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={loadServices}
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
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} tintColor={colors.accent} />}
      >
        {/* HEADER */}
        <AnimatedSection delay={0}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Mis Servicios</Text>
            <Text style={styles.headerSubtitle}>Consulta el estado de todas tus solicitudes y servicios activos.</Text>
          </View>
        </AnimatedSection>

        {/* STATUS SUMMARY */}
        <AnimatedSection delay={80}>
          <View style={styles.summaryGrid}>
            <StatusSummaryCard icon="clock-outline" count={statusCounts.pendientes} label="Pendientes" color="#f59e0b" bgColor="#FFFBEB" />
            <StatusSummaryCard icon="truck-delivery-outline" count={statusCounts.en_camino} label="En Camino" color="#14b8a6" bgColor="#F0FDFA" />
            <StatusSummaryCard icon="play-circle-outline" count={statusCounts.en_uso} label="En Uso" color={colors.accent} bgColor={colors.accentTint} />
            <StatusSummaryCard icon="calendar-clock" count={statusCounts.reservados} label="Reservados" color="#6366f1" bgColor="#EEF2FF" />
          </View>
        </AnimatedSection>

        {/* SEARCH */}
        <AnimatedSection delay={120}>
          <TouchableOpacity
            style={[styles.searchPill, { backgroundColor: colors.white }]}
            activeOpacity={0.8}
            onPress={() => setShowSearch(true)}
          >
            <Icon source="magnify" size={20} color={colors.gray400} />
            {showSearch ? (
              <TextInput
                autoFocus
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar por codigo, empresa, direccion..."
                placeholderTextColor={colors.gray400}
                style={[styles.searchInput, { color: colors.gray900 }]}
                onBlur={() => { if (!searchQuery) setShowSearch(false); }}
              />
            ) : (
              <Text style={styles.searchPlaceholder}>Buscar por codigo, empresa, direccion...</Text>
            )}
            {showSearch && searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon source="close-circle" size={18} color={colors.gray400} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </AnimatedSection>

        {/* SORT */}
        <AnimatedSection delay={140}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowSort(!showSort)}
            style={[styles.sortToggle, { backgroundColor: colors.white }]}
          >
            <Icon source="sort" size={16} color={colors.blue900} />
            <Text style={styles.sortToggleText}>Ordenar</Text>
            <Icon source={showSort ? 'chevron-up' : 'chevron-down'} size={16} color={colors.gray400} />
          </TouchableOpacity>
          {showSort && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortContainer}>
              {SORT_OPTIONS.map((opt) => {
                const isActive = sortBy === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    activeOpacity={0.7}
                    onPress={() => { setSortBy(opt.key); setShowSort(false); }}
                    style={[styles.sortChip, isActive && { backgroundColor: colors.accent }]}
                  >
                    <Text style={[styles.sortLabel, isActive && { color: colors.white }]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </AnimatedSection>

        {/* FILTERS */}
        <AnimatedSection delay={160}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
            {FILTER_OPTIONS.map((opt) => {
              const isActive = activeFilter === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  activeOpacity={0.7}
                  onPress={() => setActiveFilter(opt.key)}
                  style={[styles.filterChip, isActive ? { backgroundColor: colors.accent } : { backgroundColor: colors.white, borderColor: colors.gray100 }]}
                >
                  <Text style={[styles.filterLabel, isActive ? { color: colors.white } : { color: colors.gray600 }]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </AnimatedSection>

        {/* CARDS */}
        {filtered.map((service, index) => (
          <ServiceCard key={service.uuid || service.id || index} service={service} index={index} onViewDetail={handleViewDetail} />
        ))}

        {/* EMPTY STATE */}
        {filtered.length === 0 && (
          <AnimatedSection delay={200}>
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconWrap, { backgroundColor: colors.gray50 }]}>
                <Icon source="washing-machine" size={48} color={colors.gray300} />
              </View>
              <Text style={styles.emptyTitle}>Aun no tienes servicios activos</Text>
              <Text style={styles.emptyDesc}>Cuando solicites un servicio podras hacer seguimiento desde aqui.</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/(app)/companies')}
                style={[styles.emptyBtn, { backgroundColor: colors.accent }]}
              >
                <Icon source="storefront" size={18} color={colors.white} />
                <Text style={styles.emptyBtnText}>Buscar Empresas</Text>
              </TouchableOpacity>
            </View>
          </AnimatedSection>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* DETAIL MODAL */}
      <Modal visible={showDetail} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.white }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle del servicio</Text>
              <TouchableOpacity onPress={() => setShowDetail(false)} style={styles.modalClose}>
                <Icon source="close" size={22} color={colors.gray600} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedService && (
                <View style={styles.detailBody}>
                  <View style={[styles.detailCompany, { backgroundColor: colors.gray50 }]}>
                    <View style={[styles.detailLogo, { backgroundColor: getLogoBg(0) }]}>
                      <Text style={styles.detailLogoText}>{(selectedService.empresaNombre || 'E').charAt(0)}</Text>
                    </View>
                    <View>
                      <Text style={styles.detailCompanyName}>{selectedService.empresaNombre}</Text>
                      <View style={styles.detailRatingRow}>
                        <Text style={styles.detailCode}>{selectedService.serviceCode}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.detailGrid}>
                    <DetailRow icon="map-marker-outline" label="Direccion" value={selectedService.direccion} />
                    <DetailRow icon="washing-machine" label="Lavadora" value={`${selectedService.lavadoraMarca} ${selectedService.lavadoraModelo}`} />
                    <DetailRow icon="weight" label="Capacidad" value={selectedService.capacidad} />
                    {selectedService.repartidorNombre ? (
                      <DetailRow icon="truck-delivery-outline" label="Repartidor" value={`${selectedService.repartidorNombre} ${selectedService.repartidorTelefono ? '- ' + selectedService.repartidorTelefono : ''}`} />
                    ) : null}
                    {selectedService.fechaInicio ? (
                      <DetailRow icon="calendar-outline" label="Fecha" value={new Date(selectedService.fechaInicio).toLocaleDateString('es-CO')} />
                    ) : null}
                    {selectedService.fechaInicio ? (
                      <DetailRow icon="clock-outline" label="Hora" value={new Date(selectedService.fechaInicio).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })} />
                    ) : null}
                    {selectedService.fechaProgramada ? (
                      <DetailRow icon="calendar-clock" label="Programada" value={new Date(selectedService.fechaProgramada).toLocaleString('es-CO')} />
                    ) : null}
                    {selectedService.minutosFacturados ? (
                      <DetailRow icon="timer-sand" label="Minutos facturados" value={formatMinutes(selectedService.minutosFacturados)} />
                    ) : null}
                    {selectedService.valorTotal > 0 ? (
                      <DetailRow icon="cash" label="Valor total" value={formatCurrency(selectedService.valorTotal)} />
                    ) : null}
                    {selectedService.observaciones ? <DetailRow icon="note-text-outline" label="Observaciones" value={selectedService.observaciones} /> : null}

                    <View style={styles.detailStatusRow}>
                      <Text style={styles.detailLabel}>Estado</Text>
                      <View style={[styles.detailStatusBadge, { backgroundColor: SERVICE_STATUS_CONFIG[selectedService.status]?.bg || colors.gray50 }]}>
                        <Icon source={SERVICE_STATUS_CONFIG[selectedService.status]?.icon || 'circle'} size={12} color={SERVICE_STATUS_CONFIG[selectedService.status]?.color || colors.gray400} />
                        <Text style={[styles.detailStatusText, { color: SERVICE_STATUS_CONFIG[selectedService.status]?.color || colors.gray400 }]}>{SERVICE_STATUS_CONFIG[selectedService.status]?.label || selectedService.estadoNombre || selectedService.status}</Text>
                      </View>
                    </View>
                  </View>

                  {selectedService.timeline && Object.keys(selectedService.timeline).length > 0 && (
                    <>
                      <Text style={styles.detailTimelineTitle}>Cronologia del servicio</Text>
                      <View style={styles.detailTimeline}>
                        {['solicitud', 'aceptada', 'programada', 'en_camino', 'lavadora_entregada', 'en_uso', 'finalizacion_solicitada', 'recogida', 'finalizada'].map((key) => {
                          const value = selectedService.timeline[key];
                          return (
                            <View key={key} style={styles.detailTimelineItem}>
                              <View style={[styles.detailTimelineDot, value ? { backgroundColor: colors.accent } : { backgroundColor: colors.gray300 }]} />
                              <View style={styles.detailTimelineInfo}>
                                <Text style={[styles.detailTimelineLabel, value ? { color: colors.blue900 } : { color: colors.gray400 }]}>{key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</Text>
                                <Text style={[styles.detailTimelineValue, value ? { color: colors.gray600 } : { color: colors.gray300 }]}>{value || 'Pendiente'}</Text>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </>
                  )}

                  <View style={styles.detailActions}>
                    {selectedService.status === 'en_uso' && (
                      <AppButton title="Abrir Mi Servicio Activo" onPress={handleNavigateActive} variant="primary" fullWidth icon="play-circle-outline" />
                    )}
                    {selectedService.puedeRastrear && (
                      <AppButton title="Seguir Servicio" onPress={() => Alert.alert('Proximamente', 'El seguimiento en tiempo real estara disponible pronto.')} variant="primary" fullWidth icon="crosshairs-gps" />
                    )}
                    {selectedService.status !== 'cancelado' && selectedService.status !== 'finalizada' && (
                      <AppButton title="Ver Empresa" onPress={handleNavigateCompany} variant="outline" fullWidth icon="storefront" />
                    )}
                    {selectedService.puedeCancelar && (
                      <AppButton title="Cancelar Servicio" onPress={() => setShowCancelModal(true)} variant="ghost" fullWidth icon="close-outline" />
                    )}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CANCEL MODAL */}
      <Modal visible={showCancelModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.cancelModal, { backgroundColor: colors.white }]}>
            <View style={[styles.cancelIconWrap, { backgroundColor: colors.error + '15' }]}>
              <Icon source="alert-circle-outline" size={32} color={colors.error} />
            </View>
            <Text style={styles.cancelTitle}>Cancelar servicio</Text>
            <Text style={styles.cancelDesc}>Estas seguro que deseas cancelar este servicio? Esta accion no se puede deshacer.</Text>
            <View style={styles.cancelActions}>
              <AppButton title="No, mantener" onPress={() => setShowCancelModal(false)} variant="outline" style={{ flex: 1 }} />
              <AppButton title="Si, cancelar" onPress={handleCancelService} variant="primary" style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailRowLeft}>
        <Icon source={icon} size={16} color={colors.gray400} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  scrollContent: { paddingBottom: 32 },

  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 4 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 26, color: colors.blue900, letterSpacing: -0.4, marginBottom: 4 },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray600 },

  summaryGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginTop: 16 },
  summaryCard: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: radii.md, gap: 4 },
  summaryCount: { fontFamily: 'Poppins_700Bold', fontSize: 20 },
  summaryLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, color: colors.gray600 },

  searchPill: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, marginTop: 16, paddingHorizontal: 18, height: 50, borderRadius: radii.full, ...shadows.lg },
  searchPlaceholder: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray400, flex: 1 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, padding: 0, margin: 0, outlineStyle: 'none', ...(Platform.OS === 'web' ? { outline: 'none' } : {}) },

  sortToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 20, marginTop: 12, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.full, alignSelf: 'flex-start', ...shadows.sm },
  sortToggleText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.blue900 },
  sortContainer: { paddingHorizontal: 20, gap: 8, paddingVertical: 10 },
  sortChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radii.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray100 },
  sortLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.gray600 },

  filtersContainer: { paddingHorizontal: 20, gap: 8, paddingBottom: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.full, borderWidth: 1, borderColor: 'transparent' },
  filterLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },

  cardMargin: { marginHorizontal: 20, marginBottom: 12 },
  card: { borderRadius: radii.lg, padding: 16, ...shadows.sm },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardLogo: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cardLogoText: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: colors.white },
  cardCompanyArea: { flex: 1 },
  cardCompanyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardCompany: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.blue900, flex: 1 },
  cardRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  cardRating: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#f59e0b' },
  cardCode: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray400, marginTop: 1 },
  cardBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: radii.full },
  cardBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },

  cardDetails: { gap: 6, marginBottom: 12 },
  cardDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardDetailText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray600 },
  cardDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.gray300, marginHorizontal: 3 },

  timelineWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: radii.sm, marginBottom: 12, gap: 0 },
  timelineStep: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: colors.gray300, backgroundColor: colors.white, zIndex: 1 },
  timelineDotCurrent: { width: 12, height: 12, borderRadius: 6 },
  timelineLine: { flex: 1, height: 2, backgroundColor: colors.gray200 },

  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32, gap: 12 },
  emptyIconWrap: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.blue900, textAlign: 'center' },
  emptyDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray600, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 13, paddingHorizontal: 24, borderRadius: radii.full, marginTop: 8 },
  emptyBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.white },

  skeletonWrap: { paddingHorizontal: 20, paddingTop: 16, gap: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, maxHeight: '90%', paddingBottom: Platform.OS === 'ios' ? 32 : 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.gray50 },
  modalTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: colors.blue900 },
  modalClose: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray50 },

  detailBody: { padding: 20 },
  detailCompany: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radii.md, marginBottom: 16 },
  detailLogo: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  detailLogoText: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: colors.white },
  detailCompanyName: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.blue900 },
  detailRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  detailRating: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#f59e0b' },
  detailCode: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray400, marginLeft: 8 },

  detailGrid: { gap: 0 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray50 },
  detailRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  detailLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600 },
  detailValue: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.blue900, textAlign: 'right', flex: 1, marginLeft: 8 },

  detailStatusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  detailStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full },
  detailStatusText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },

  detailTimelineTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: colors.blue900, marginTop: 20, marginBottom: 12 },
  detailTimeline: { gap: 0 },
  detailTimelineItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  detailTimelineDot: { width: 10, height: 10, borderRadius: 5 },
  detailTimelineInfo: { flex: 1 },
  detailTimelineLabel: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  detailTimelineValue: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },

  detailActions: { gap: 10, marginTop: 24 },

  cancelModal: { marginHorizontal: 24, borderRadius: radii.lg, padding: 24, alignItems: 'center', marginBottom: 24 },
  cancelIconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  cancelTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.blue900, marginBottom: 8 },
  cancelDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray600, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  cancelActions: { flexDirection: 'row', gap: 10 },
});
