import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform, TextInput, Modal, Alert, RefreshControl } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getLogoBg } from '../../src/constants/data/home';
import { formatCurrency, formatMinutes } from '../../src/utils/formatters';
import { colors, radii, shadows } from '../../src/theme';
import { historyService } from '../../src/services/history.service';
import AppButton from '../../src/components/ui/AppButton';
import SkeletonCard from '../../src/components/ui/SkeletonCard';

const FILTER_OPTIONS = [
  { key: 'all', label: 'Todos' },
  { key: 'finalizado', label: 'Finalizados' },
  { key: 'cancelado', label: 'Cancelados' },
  { key: 'reviewed', label: 'Con resena' },
  { key: 'no_reviewed', label: 'Sin resena' },
  { key: '30d', label: 'Ultimos 30 dias' },
  { key: '3m', label: 'Ultimos 3 meses' },
  { key: 'year', label: 'Este anio' },
];

const SORT_OPTIONS = [
  { key: 'recent', label: 'Mas recientes' },
  { key: 'oldest', label: 'Mas antiguos' },
  { key: 'value_desc', label: 'Mayor valor' },
  { key: 'value_asc', label: 'Menor valor' },
  { key: 'duration', label: 'Mayor duracion' },
];

const STATUS_CONFIG = {
  finalizado: { color: '#10b981', bg: '#ECFDF5', icon: 'check-decagram', label: 'Finalizado' },
  cancelado: { color: '#ef4444', bg: '#FEF2F2', icon: 'close-circle-outline', label: 'Cancelado' },
  incidencia: { color: '#f59e0b', bg: '#FFFBEB', icon: 'alert-circle-outline', label: 'Incidencia' },
  devolucion_tardia: { color: '#8b5cf6', bg: '#F5F3FF', icon: 'clock-alert-outline', label: 'Devolucion tardia' },
};

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

function StarRating({ rating, size = 18, interactive = false, onChange }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          activeOpacity={interactive ? 0.6 : 1}
          onPress={() => interactive && onChange?.(star)}
          style={styles.starBtn}
        >
          <Icon
            source={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? '#f59e0b' : colors.gray300}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showSort, setShowSort] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async () => {
    try {
      setError(null);
      const response = await historyService.getMisHistorial();
      setServices((response.data || []).filter(Boolean));
    } catch (err) {
      console.error('Error loading history:', err);
      setError(err.message || 'Error al cargar historial');
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadHistory();
      setIsLoading(false);
    })();
  }, [loadHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  const historyStats = useMemo(() => {
    const total = services.length;
    const totalMinutes = services.reduce((acc, s) => acc + (s.minutosFacturados || 0), 0);
    const totalHours = Math.round(totalMinutes / 60);
    const totalSpent = services.reduce((acc, s) => acc + (s.valorTotal || 0), 0);
    const companyCounts = {};
    services.forEach((s) => {
      if (s.empresaNombre) {
        companyCounts[s.empresaNombre] = (companyCounts[s.empresaNombre] || 0) + 1;
      }
    });
    const mostUsed = Object.entries(companyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    return { totalServices: total, totalHours, totalMoneySpent: totalSpent, mostUsedCompany: mostUsed };
  }, [services]);

  const filtered = useMemo(() => {
    let result = [...services];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          (s.serviceCode || '').toLowerCase().includes(q) ||
          (s.empresaNombre || '').toLowerCase().includes(q) ||
          (s.capacidad || '').toLowerCase().includes(q) ||
          (s.lavadoraMarca || '').toLowerCase().includes(q)
      );
    }

    if (activeFilter !== 'all') {
      switch (activeFilter) {
        case 'finalizado':
          result = result.filter((s) => s.status === 'finalizado');
          break;
        case 'cancelado':
          result = result.filter((s) => s.status === 'cancelado');
          break;
        case '30d': {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          result = result.filter((s) => s.fechaInicio && new Date(s.fechaInicio) >= thirtyDaysAgo);
          break;
        }
        case '3m': {
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          result = result.filter((s) => s.fechaInicio && new Date(s.fechaInicio) >= threeMonthsAgo);
          break;
        }
        case 'year': {
          const yearStart = new Date(new Date().getFullYear(), 0, 1);
          result = result.filter((s) => s.fechaInicio && new Date(s.fechaInicio) >= yearStart);
          break;
        }
      }
    }

    switch (sortBy) {
      case 'oldest':
        result = [...result].reverse();
        break;
      case 'value_desc':
        result = [...result].sort((a, b) => (b.valorTotal || 0) - (a.valorTotal || 0));
        break;
      case 'value_asc':
        result = [...result].sort((a, b) => (a.valorTotal || 0) - (b.valorTotal || 0));
        break;
      case 'duration':
        result = [...result].sort((a, b) => (b.minutosFacturados || 0) - (a.minutosFacturados || 0));
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

  const handleViewInvoice = useCallback(() => {
    setShowDetail(false);
    setTimeout(() => setShowInvoice(true), 300);
  }, []);

  const handleOpenReview = useCallback(() => {
    setShowDetail(false);
    setTimeout(() => setShowReviewModal(true), 300);
  }, []);

  const handleSubmitReview = useCallback(() => {
    if (reviewRating === 0) return;
    Alert.alert('Resena enviada', 'Gracias por tu calificacion.');
    setShowReviewModal(false);
    setReviewRating(0);
    setReviewComment('');
  }, [reviewRating, reviewComment]);

  const handleRehire = useCallback(() => {
    Alert.alert('Proximamente', 'La funcion de volver a contratar estara disponible pronto.');
  }, []);

  const historyInvoice = useMemo(() => {
    if (!selectedService) return null;
    const subtotal = selectedService.valorTotal || 0;
    const iva = Math.round(subtotal * 0.19);
    return {
      id: selectedService.serviceCode || 'N/A',
      companyName: selectedService.empresaNombre || '',
      date: selectedService.fechaInicio || '',
      subtotal,
      iva,
      total: subtotal + iva,
      paymentMethod: 'Efectivo',
      status: 'Pendiente',
    };
  }, [selectedService]);

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Historial de Servicios</Text>
          <Text style={styles.headerSubtitle}>Cargando...</Text>
        </View>
        <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 12 }}>
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
          <Text style={styles.headerTitle}>Historial de Servicios</Text>
          <Text style={styles.headerSubtitle}>Error al cargar</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.error + '15' }]}>
            <Icon source="alert-circle-outline" size={48} color={colors.error} />
          </View>
          <Text style={styles.emptyTitle}>Error al cargar historial</Text>
          <Text style={styles.emptyDesc}>{error}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={loadHistory}
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
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.headerTitle}>Historial de Servicios</Text>
                <Text style={styles.headerSubtitle}>{services.length} servicios realizados</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowSearch(!showSearch)}
                  style={[styles.headerBtn, { backgroundColor: colors.white }]}
                >
                  <Icon source={showSearch ? 'close' : 'magnify'} size={20} color={colors.blue900} />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowSort(!showSort)}
                  style={[styles.headerBtn, { backgroundColor: colors.white }]}
                >
                  <Icon source="sort" size={20} color={colors.blue900} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </AnimatedSection>

        {/* STATS */}
        <AnimatedSection delay={80}>
          <View style={[styles.statsCard, { backgroundColor: colors.white }]}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{historyStats.totalServices}</Text>
                <Text style={styles.statLabel}>Servicios</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.accent }]}>{historyStats.totalHours}h</Text>
                <Text style={styles.statLabel}>Horas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{formatCurrency(historyStats.totalMoneySpent)}</Text>
                <Text style={styles.statLabel}>Invertido</Text>
              </View>
            </View>
            <View style={[styles.statCompany, { backgroundColor: colors.gray50 }]}>
              <Icon source="domain" size={14} color={colors.accent} />
              <Text style={styles.statCompanyText}>Mas utilizada: {historyStats.mostUsedCompany}</Text>
            </View>
          </View>
        </AnimatedSection>

        {/* SEARCH */}
        {showSearch && (
          <AnimatedSection delay={0}>
            <View style={[styles.searchPill, { backgroundColor: colors.white }]}>
              <Icon source="magnify" size={20} color={colors.gray400} />
              <TextInput
                autoFocus
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar por codigo, empresa, capacidad..."
                placeholderTextColor={colors.gray400}
                style={[styles.searchInput, { color: colors.gray900 }]}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon source="close-circle" size={18} color={colors.gray400} />
                </TouchableOpacity>
              )}
            </View>
          </AnimatedSection>
        )}

        {/* SORT */}
        {showSort && (
          <AnimatedSection delay={0}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortContainer}
            >
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
          </AnimatedSection>
        )}

        {/* FILTERS */}
        <AnimatedSection delay={120}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
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
          <HistoryCard key={service.uuid || service.id || index} service={service} index={index} onViewDetail={handleViewDetail} />
        ))}

        {/* EMPTY STATE */}
        {filtered.length === 0 && (
          <AnimatedSection delay={200}>
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconWrap, { backgroundColor: colors.gray50 }]}>
                <Icon source="history" size={48} color={colors.gray300} />
              </View>
              <Text style={styles.emptyTitle}>Sin resultados</Text>
              <Text style={styles.emptyDesc}>No se encontraron servicios con los filtros seleccionados.</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/(app)/services')}
                style={[styles.emptyBtn, { backgroundColor: colors.accent }]}
              >
                <Icon source="washing-machine" size={18} color={colors.white} />
                <Text style={styles.emptyBtnText}>Solicitar primer servicio</Text>
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
                      <Text style={styles.detailCode}>{selectedService.serviceCode}</Text>
                    </View>
                  </View>

                  <View style={styles.detailGrid}>
                    <DetailRow icon="map-marker-outline" label="Direccion" value={selectedService.direccion} />
                    <DetailRow icon="washing-machine" label="Lavadora" value={`${selectedService.lavadoraMarca} ${selectedService.lavadoraModelo}`} />
                    <DetailRow icon="weight" label="Capacidad" value={selectedService.capacidad} />
                    {selectedService.repartidorNombre ? (
                      <DetailRow icon="truck-delivery-outline" label="Repartidor" value={selectedService.repartidorNombre} />
                    ) : null}
                    {selectedService.fechaInicio ? (
                      <DetailRow icon="calendar-outline" label="Fecha" value={new Date(selectedService.fechaInicio).toLocaleDateString('es-CO')} />
                    ) : null}
                    {selectedService.fechaInicio ? (
                      <DetailRow icon="clock-outline" label="Hora inicio" value={new Date(selectedService.fechaInicio).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })} />
                    ) : null}
                    {selectedService.fechaFin ? (
                      <DetailRow icon="clock-check-outline" label="Hora final" value={new Date(selectedService.fechaFin).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })} />
                    ) : null}
                    {selectedService.minutosFacturados ? (
                      <DetailRow icon="timer-sand" label="Tiempo facturado" value={formatMinutes(selectedService.minutosFacturados)} />
                    ) : null}
                    <DetailRow icon="cash-multiple" label="Valor total" value={formatCurrency(selectedService.valorTotal)} highlight />

                    <View style={styles.detailStatusRow}>
                      <Text style={styles.detailLabel}>Estado</Text>
                      <View style={[styles.detailStatusBadge, { backgroundColor: STATUS_CONFIG[selectedService.status]?.bg || colors.gray50 }]}>
                        <Icon source={STATUS_CONFIG[selectedService.status]?.icon || 'circle'} size={12} color={STATUS_CONFIG[selectedService.status]?.color || colors.gray400} />
                        <Text style={[styles.detailStatusText, { color: STATUS_CONFIG[selectedService.status]?.color || colors.gray400 }]}>{STATUS_CONFIG[selectedService.status]?.label || selectedService.estadoNombre || selectedService.status}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.detailActions}>
                    <AppButton title="Solicitar nuevamente" onPress={handleRehire} variant="ghost" fullWidth icon="refresh" />
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* INVOICE MODAL */}
      <Modal visible={showInvoice} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.white }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Factura</Text>
              <TouchableOpacity onPress={() => setShowInvoice(false)} style={styles.modalClose}>
                <Icon source="close" size={22} color={colors.gray600} />
              </TouchableOpacity>
            </View>

            <View style={styles.invoiceBody}>
              {historyInvoice && (<>
              <View style={[styles.invoiceCard, { backgroundColor: colors.gray50 }]}>
                <Text style={styles.invoiceCode}>{historyInvoice.id}</Text>
                <Text style={styles.invoiceCompany}>{historyInvoice.companyName}</Text>
                <Text style={styles.invoiceDate}>{historyInvoice.date}</Text>

                <View style={styles.invoiceDivider} />

                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceLabel}>Subtotal</Text>
                  <Text style={styles.invoiceValue}>{formatCurrency(historyInvoice.subtotal)}</Text>
                </View>
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceLabel}>IVA</Text>
                  <Text style={styles.invoiceValue}>{formatCurrency(historyInvoice.iva)}</Text>
                </View>
                <View style={[styles.invoiceRow, { borderTopWidth: 1, borderTopColor: colors.gray100, paddingTop: 10, marginTop: 6 }]}>
                  <Text style={[styles.invoiceLabel, { fontFamily: 'Inter_600SemiBold', color: colors.blue900 }]}>Total</Text>
                  <Text style={[styles.invoiceValue, { fontFamily: 'Poppins_700Bold', fontSize: 18, color: colors.accent }]}>{formatCurrency(historyInvoice.total)}</Text>
                </View>

                <View style={styles.invoiceDivider} />

                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceLabel}>Metodo de pago</Text>
                  <Text style={styles.invoiceValue}>{historyInvoice.paymentMethod}</Text>
                </View>
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceLabel}>Estado</Text>
                  <View style={[styles.invoiceStatusBadge, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={[styles.invoiceStatusText, { color: '#10b981' }]}>{historyInvoice.status}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.invoiceNote}>La factura electronica estara disponible para descarga proximamente.</Text>
              </>)}
            </View>
          </View>
        </View>
      </Modal>

      {/* REVIEW MODAL */}
      <Modal visible={showReviewModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.white }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Calificar servicio</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)} style={styles.modalClose}>
                <Icon source="close" size={22} color={colors.gray600} />
              </TouchableOpacity>
            </View>

            <View style={styles.reviewBody}>
              <Text style={styles.reviewPrompt}>Como calificarias este servicio?</Text>
              <StarRating rating={reviewRating} size={32} interactive onChange={setReviewRating} />

              <TextInput
                style={[styles.reviewInput, { color: colors.gray900, borderColor: colors.gray100 }]}
                placeholder="Comparte tu experiencia (opcional)"
                placeholderTextColor={colors.gray400}
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              <Text style={styles.reviewCount}>{reviewComment.length}/500</Text>

              <AppButton
                title="Enviar resena"
                onPress={handleSubmitReview}
                variant="primary"
                fullWidth
                disabled={reviewRating === 0}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailRow({ icon, label, value, highlight }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailRowLeft}>
        <Icon source={icon} size={16} color={colors.gray400} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={[styles.detailValue, highlight && { color: colors.accent, fontFamily: 'Poppins_600SemiBold' }]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const HistoryCard = React.memo(function HistoryCard({ service, index, onViewDetail }) {
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

  const st = STATUS_CONFIG[service.status] || STATUS_CONFIG.finalizado;

  const fechaStr = useMemo(() => {
    if (!service.fechaInicio) return '';
    const d = new Date(service.fechaInicio);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }, [service.fechaInicio]);

  const horaInicio = useMemo(() => {
    if (!service.fechaInicio) return '';
    const d = new Date(service.fechaInicio);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
  }, [service.fechaInicio]);

  const horaFin = useMemo(() => {
    if (!service.fechaFin) return '';
    const d = new Date(service.fechaFin);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
  }, [service.fechaFin]);

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
            <Text style={styles.cardCompany} numberOfLines={1}>{service.empresaNombre}</Text>
            <Text style={styles.cardCode}>{service.serviceCode}</Text>
          </View>
          <View style={[styles.cardBadge, { backgroundColor: st.bg }]}>
            <Icon source={st.icon} size={11} color={st.color} />
            <Text style={[styles.cardBadgeText, { color: st.color }]}>{st.label}</Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.cardDetailRow}>
            <Icon source="calendar-outline" size={13} color={colors.gray400} />
            <Text style={styles.cardDetailText}>{fechaStr}</Text>
            {horaInicio ? <View style={styles.cardDot} /> : null}
            {horaInicio ? <Icon source="clock-outline" size={13} color={colors.gray400} /> : null}
            {horaInicio ? <Text style={styles.cardDetailText}>{horaInicio}{horaFin ? ` - ${horaFin}` : ''}</Text> : null}
          </View>
          <View style={styles.cardDetailRow}>
            <Icon source="washing-machine" size={13} color={colors.gray400} />
            <Text style={styles.cardDetailText}>{service.lavadoraMarca} - {service.capacidad}</Text>
            {service.minutosFacturados ? <View style={styles.cardDot} /> : null}
            {service.minutosFacturados ? <Icon source="timer-sand" size={13} color={colors.gray400} /> : null}
            {service.minutosFacturados ? <Text style={styles.cardDetailText}>{formatMinutes(service.minutosFacturados)}</Text> : null}
          </View>
        </View>

        <View style={styles.cardBottom}>
          <Text style={styles.cardPrice}>{formatCurrency(service.valorTotal)}</Text>
          <Icon source="chevron-right" size={18} color={colors.gray300} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({ 
  screen: { flex: 1, backgroundColor: colors.gray50 },
  scrollContent: { paddingBottom: 32 },

  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 4 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 26, color: colors.blue900, letterSpacing: -0.4, marginBottom: 4 },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray600 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', ...shadows.sm },

  statsCard: { marginHorizontal: 24, marginTop: 16, borderRadius: radii.lg, padding: 16, ...shadows.sm },
  statsGrid: { flexDirection: 'row', gap: 8 },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 8, backgroundColor: colors.gray50, borderRadius: radii.sm },
  statNumber: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: colors.blue900 },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray600, marginTop: 2 },
  statCompany: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, paddingVertical: 8, borderRadius: radii.sm },
  statCompanyText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.gray600 },

  searchPill: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 24, marginTop: 16, paddingHorizontal: 18, height: 50, borderRadius: radii.full, ...shadows.lg },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, padding: 0, margin: 0, outlineStyle: 'none', ...(Platform.OS === 'web' ? { outline: 'none' } : {}) },

  sortContainer: { paddingHorizontal: 24, gap: 8, paddingVertical: 12 },
  sortChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray100 },
  sortLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.gray600 },

  filtersContainer: { paddingHorizontal: 24, gap: 8, paddingBottom: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radii.full, borderWidth: 1, borderColor: 'transparent' },
  filterLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },

  cardMargin: { marginHorizontal: 24, marginBottom: 12 },
  card: { borderRadius: radii.lg, padding: 16, ...shadows.sm },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardLogo: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cardLogoText: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: colors.white },
  cardCompanyArea: { flex: 1 },
  cardCompany: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.blue900 },
  cardCode: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray400, marginTop: 1 },
  cardBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: radii.full },
  cardBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },

  cardDetails: { gap: 6, marginBottom: 12 },
  cardDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardDetailText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray600 },
  cardDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.gray300, marginHorizontal: 3 },

  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontFamily: 'Poppins_700Bold', fontSize: 17, color: colors.accent, letterSpacing: -0.3 },
  cardReviewBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.full },
  cardReviewText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#f59e0b' },

  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32, gap: 12 },
  emptyIconWrap: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.blue900, textAlign: 'center' },
  emptyDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray600, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 13, paddingHorizontal: 24, borderRadius: radii.full, marginTop: 8 },
  emptyBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.white },

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
  detailCode: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray400, marginTop: 2 },

  detailGrid: { gap: 0 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray50 },
  detailRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  detailLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600 },
  detailValue: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.blue900, textAlign: 'right', flex: 1, marginLeft: 8 },

  detailStatusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray50 },
  detailStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full },
  detailStatusText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },

  detailReview: { padding: 14, borderRadius: radii.md, marginTop: 12, marginBottom: 8 },
  detailReviewComment: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600, marginTop: 8, lineHeight: 18 },
  detailReviewDate: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray400, marginTop: 6 },

  detailActions: { gap: 10, marginTop: 20 },

  invoiceBody: { padding: 20 },
  invoiceCard: { padding: 20, borderRadius: radii.md, marginBottom: 12 },
  invoiceCode: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.blue900, marginBottom: 4 },
  invoiceCompany: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray600 },
  invoiceDate: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray400, marginTop: 2 },
  invoiceDivider: { height: 1, backgroundColor: colors.gray100, marginVertical: 14 },
  invoiceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  invoiceLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600 },
  invoiceValue: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.blue900 },
  invoiceStatusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radii.full },
  invoiceStatusText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  invoiceNote: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray400, textAlign: 'center', lineHeight: 18 },

  reviewBody: { padding: 20, alignItems: 'center' },
  reviewPrompt: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.blue900, marginBottom: 16 },
  starRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  starBtn: { padding: 4 },
  reviewInput: { width: '100%', borderWidth: 1, borderRadius: radii.md, padding: 14, fontFamily: 'Inter_400Regular', fontSize: 14, minHeight: 100, textAlignVertical: 'top', marginBottom: 8 },
  reviewCount: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray400, alignSelf: 'flex-end', marginBottom: 16 },
});
