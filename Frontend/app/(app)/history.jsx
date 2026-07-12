import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, Platform, TextInput } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { appointments, companies, services } from '../../src/constants/mockData';
import { formatCurrency, formatMinutes } from '../../src/utils/formatters';
import { colors, radii, shadows } from '../../src/theme';

const extraAppointments = [
  { id: 4, serviceId: 5, serviceName: 'Lavado Express 30min', companyId: 4, date: '2026-07-12', time: '11:00', status: 'confirmado', address: 'Calle 10 #5-30, Usaquén', notes: '', price: 5000 },
  { id: 5, serviceId: 6, serviceName: 'Recogida y Entrega Full', companyId: 3, date: '2026-07-03', time: '15:00', status: 'cancelado', address: 'Cra 7 #12-34, Chapinero', notes: '', price: 8000 },
  { id: 6, serviceId: null, serviceName: 'Lavado Premium', companyId: 6, date: '2026-07-09', time: '08:00', status: 'en_proceso', address: 'Calle 45 #8-60, Chapinero', notes: '', price: 4000 },
  { id: 7, serviceId: null, serviceName: 'Lavado General', companyId: 7, date: '2026-07-15', time: '16:00', status: 'pendiente', address: 'Calle 26 #15-40, Teusaquillo', notes: 'Dejar en portería', price: 3200 },
];

const TIMELINE_STEPS = [
  'Reserva confirmada', 'Operario asignado', 'Recogiendo ropa',
  'Lavando', 'Secando', 'En camino', 'Entregado',
];

const STATUS_STYLE = {
  pendiente: { color: '#f59e0b', bg: '#FFFBEB', icon: 'clock-outline', label: 'Pendiente' },
  confirmado: { color: '#3b82f6', bg: '#EFF6FF', icon: 'check-circle-outline', label: 'Confirmada' },
  en_proceso: { color: colors.accent, bg: colors.accentTint, icon: 'progress-check', label: 'En proceso' },
  finalizado: { color: '#10b981', bg: '#ECFDF5', icon: 'check-decagram', label: 'Finalizada' },
  completado: { color: '#10b981', bg: '#ECFDF5', icon: 'check-decagram', label: 'Completada' },
  cancelado: { color: '#ef4444', bg: '#FEF2F2', icon: 'close-circle-outline', label: 'Cancelada' },
};

const filterOptions = [
  { key: 'all', label: 'Todas' },
  { key: 'activas', label: 'Activas' },
  { key: 'programadas', label: 'Programadas' },
  { key: 'finalizadas', label: 'Finalizadas' },
  { key: 'canceladas', label: 'Canceladas' },
];

const LOGO_BG = [colors.accent, colors.blue700, colors.blue500, colors.accentDark, colors.blue900, colors.accent, colors.blue700, colors.gray600];

function getLogoBg(id) {
  return LOGO_BG[(id - 1) % LOGO_BG.length];
}

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

function getTimeline(status, id) {
  if (status !== 'en_proceso') return null;
  const progressMap = { 2: 3, 6: 2 };
  const completed = progressMap[id] || 1;
  return TIMELINE_STEPS.map((step, i) => ({ step, completed: i < completed, current: i === completed - 1 }));
}

function getActions(status) {
  const all = {
    pendiente: [
      { label: 'Ver detalles', icon: 'eye-outline' },
      { label: 'Reagendar', icon: 'calendar-clock' },
      { label: 'Cancelar', icon: 'close-outline', danger: true },
    ],
    confirmado: [
      { label: 'Ver detalles', icon: 'eye-outline' },
      { label: 'Contactar empresa', icon: 'chat-outline' },
    ],
    en_proceso: [
      { label: 'Seguir servicio', icon: 'crosshairs-gps' },
      { label: 'Contactar empresa', icon: 'chat-outline' },
    ],
    finalizado: [
      { label: 'Reservar de nuevo', icon: 'calendar-plus' },
      { label: 'Calificar servicio', icon: 'star-outline' },
      { label: 'Descargar factura', icon: 'file-download-outline' },
    ],
    completado: [
      { label: 'Reservar de nuevo', icon: 'calendar-plus' },
      { label: 'Calificar servicio', icon: 'star-outline' },
      { label: 'Descargar factura', icon: 'file-download-outline' },
    ],
    cancelado: [
      { label: 'Reservar de nuevo', icon: 'calendar-plus' },
    ],
  };
  return all[status] || [];
}

function ReservationCard({ appointment, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const st = STATUS_STYLE[appointment.status] || STATUS_STYLE.pendiente;
  const timeline = getTimeline(appointment.status, appointment.id);
  const actions = getActions(appointment.status);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={[styles.card, { backgroundColor: colors.white }]}>
        {/* Top: avatar + company + service + status */}
        <View style={styles.cardTop}>
          <View style={[styles.cardLogo, { backgroundColor: getLogoBg(appointment.companyId || 1) }]}>
            <Text style={styles.cardLogoText}>{(appointment.companyName || 'E').charAt(0)}</Text>
          </View>
          <View style={styles.cardCompanyArea}>
            <Text style={styles.cardCompany} numberOfLines={1}>{appointment.companyName}</Text>
            <Text style={styles.cardService} numberOfLines={1}>{appointment.serviceName}</Text>
          </View>
          <View style={[styles.cardBadge, { backgroundColor: st.bg }]}>
            <Icon source={st.icon} size={11} color={st.color} />
            <Text style={[styles.cardBadgeText, { color: st.color }]}>{st.label}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.cardDetails}>
          <View style={styles.cardDetailRow}>
            <Icon source="calendar-outline" size={14} color={colors.gray400} />
            <Text style={styles.cardDetailText}>{appointment.date}</Text>
            <View style={styles.cardDetailDot} />
            <Icon source="clock-outline" size={14} color={colors.gray400} />
            <Text style={styles.cardDetailText}>{appointment.time}</Text>
          </View>
          <View style={styles.cardDetailRow}>
            <Icon source="map-marker-outline" size={14} color={colors.gray400} />
            <Text style={styles.cardDetailText} numberOfLines={1}>{appointment.address}</Text>
            <View style={styles.cardDetailDot} />
            <Icon source="timelapse" size={14} color={colors.gray400} />
            <Text style={styles.cardDetailText}>{formatMinutes(appointment.duration || 60)}</Text>
          </View>
        </View>

        {/* Price */}
        <View style={styles.cardPriceRow}>
          <Text style={styles.cardPrice}>{formatCurrency(appointment.price)}</Text>
        </View>

        {/* Timeline */}
        {timeline && (
          <View style={[styles.timelineWrap, { backgroundColor: colors.gray50 }]}>
            {timeline.map((step, i) => (
              <View key={i} style={styles.timelineStep}>
                <View style={styles.timelineIndicator}>
                  <View
                    style={[
                      styles.timelineDot,
                      step.completed && { backgroundColor: colors.accent, borderColor: colors.accent },
                      step.current && { backgroundColor: colors.accent, borderColor: colors.accent, ...shadows.sm },
                    ]}
                  />
                  {i < timeline.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        step.completed && { backgroundColor: colors.accent },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.timelineText,
                    step.completed && { color: colors.blue900 },
                    step.current && { fontFamily: 'Inter_600SemiBold', color: colors.accentDark },
                    !step.completed && { color: colors.gray400 },
                  ]}
                >
                  {step.step}
                </Text>
                {step.current && (
                  <View style={[styles.timelineCurrentBadge, { backgroundColor: colors.accentTint }]}>
                    <Text style={styles.timelineCurrentText}>Actual</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {appointment.notes ? (
          <View style={[styles.notesWrap, { backgroundColor: colors.gray50 }]}>
            <Icon source="note-outline" size={14} color={colors.gray400} />
            <Text style={styles.notesText}>{appointment.notes}</Text>
          </View>
        ) : null}

        {/* Actions */}
        {actions.length > 0 && (
          <View style={styles.actionsRow}>
            {actions.map((action) => (
              <TouchableOpacity key={action.label} activeOpacity={0.7} style={styles.actionBtn}>
                <Icon source={action.icon} size={14} color={action.danger ? colors.error : colors.accent} />
                <Text style={[styles.actionText, action.danger && { color: colors.error }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

export default function ReservationsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showSearch, setShowSearch] = useState(false);

  const allAppointments = useMemo(() => [...appointments, ...extraAppointments], []);
  const enrichedList = useMemo(() => {
    return allAppointments.map((apt) => {
      const service = services.find((s) => s.id === apt.serviceId);
      const company = companies.find((c) => c.id === (apt.companyId || service?.companyId));
      return {
        ...apt,
        companyName: company?.name || 'Empresa',
        companyId: company?.id || apt.companyId || 1,
        city: company?.location?.split('-')[0]?.trim() || 'Bogotá',
        duration: service?.timeEstimate || apt.duration || 60,
      };
    });
  }, [allAppointments]);

  const filtered = useMemo(() => {
    let result = [...enrichedList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.serviceName.toLowerCase().includes(q) ||
          a.companyName.toLowerCase().includes(q) ||
          a.address.toLowerCase().includes(q)
      );
    }

    if (activeFilter !== 'all') {
      switch (activeFilter) {
        case 'activas':
          result = result.filter((a) => a.status === 'en_proceso');
          break;
        case 'programadas':
          result = result.filter((a) => a.status === 'pendiente' || a.status === 'confirmado');
          break;
        case 'finalizadas':
          result = result.filter((a) => a.status === 'finalizado' || a.status === 'completado');
          break;
        case 'canceladas':
          result = result.filter((a) => a.status === 'cancelado');
          break;
      }
    }

    return result;
  }, [enrichedList, searchQuery, activeFilter]);

  const activeCount = enrichedList.filter((a) => a.status === 'en_proceso' || a.status === 'pendiente' || a.status === 'confirmado').length;

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ===== HEADER ===== */}
        <AnimatedSection delay={0}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Mis Reservas</Text>
            <Text style={styles.headerSubtitle}>
              {activeCount > 0
                ? `Tienes ${activeCount} reserva${activeCount !== 1 ? 's' : ''} activa${activeCount !== 1 ? 's' : ''}`
                : 'Tu actividad reciente'}
            </Text>
          </View>
        </AnimatedSection>

        {/* ===== STATS ===== */}
        <AnimatedSection delay={80}>
          <View style={[styles.statsCard, { backgroundColor: colors.white }]}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>12</Text>
                <Text style={styles.statLabel}>Servicios</Text>
              </View>
              <View style={styles.statDiv} />
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>5</Text>
                <Text style={styles.statLabel}>Empresas</Text>
              </View>
              <View style={styles.statDiv} />
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>28h</Text>
                <Text style={styles.statLabel}>Uso total</Text>
              </View>
              <View style={styles.statDiv} />
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>Plata</Text>
                <Text style={styles.statLabel}>Nivel</Text>
              </View>
            </View>
          </View>
        </AnimatedSection>

        {/* ===== SEARCH ===== */}
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
                placeholder="Buscar por empresa, servicio..."
                placeholderTextColor={colors.gray400}
                style={[styles.searchInput, { color: colors.gray900 }]}
                onBlur={() => { if (!searchQuery) setShowSearch(false); }}
              />
            ) : (
              <Text style={styles.searchPlaceholder}>Buscar por empresa, servicio...</Text>
            )}
          </TouchableOpacity>
        </AnimatedSection>

        {/* ===== FILTERS ===== */}
        <AnimatedSection delay={160}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {filterOptions.map((opt) => {
              const isActive = activeFilter === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  activeOpacity={0.7}
                  onPress={() => setActiveFilter(opt.key)}
                  style={[
                    styles.filterChip,
                    isActive
                      ? { backgroundColor: colors.accent }
                      : { backgroundColor: colors.white, borderColor: colors.gray100 },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterLabel,
                      isActive ? { color: colors.white } : { color: colors.gray600 },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </AnimatedSection>

        {/* ===== CARDS ===== */}
        {filtered.map((apt, index) => (
          <ReservationCard key={apt.id} appointment={apt} index={index} />
        ))}

        {/* ===== EMPTY STATE ===== */}
        {filtered.length === 0 && (
          <AnimatedSection delay={200}>
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconWrap, { backgroundColor: colors.gray50 }]}>
                <Icon source="calendar-clock-outline" size={48} color={colors.gray300} />
              </View>
              <Text style={styles.emptyTitle}>No tienes reservas todavía</Text>
              <Text style={styles.emptyDesc}>
                Explora los servicios disponibles y reserva tu primera lavandería en minutos.
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/(app)/services')}
                style={[styles.emptyBtn, { backgroundColor: colors.accent }]}
              >
                <Icon source="magnify" size={18} color={colors.white} />
                <Text style={styles.emptyBtnText}>Explorar servicios</Text>
              </TouchableOpacity>
            </View>
          </AnimatedSection>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  scrollContent: { paddingBottom: 32 },

  /* ===== HEADER ===== */
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 4 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 26, color: colors.blue900, letterSpacing: -0.4, marginBottom: 4 },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray600 },

  /* ===== STATS ===== */
  statsCard: { marginHorizontal: 24, marginTop: 16, borderRadius: radii.lg, padding: 16, ...shadows.sm },
  statsGrid: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statIcon: { fontFamily: 'Poppins_700Bold', fontSize: 22, color: colors.accent, letterSpacing: -0.3 },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray600, marginTop: 1 },
  statDiv: { width: 1, height: 30, backgroundColor: colors.gray100 },

  /* ===== SEARCH ===== */
  searchPill: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 24, marginTop: 16, paddingHorizontal: 18,
    height: 50, borderRadius: radii.full, ...shadows.lg,
  },
  searchPlaceholder: { fontFamily: 'Inter_400Regular', fontSize: 15, color: colors.gray400, flex: 1 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, padding: 0, margin: 0, outlineStyle: 'none', ...(Platform.OS === 'web' ? { outline: 'none' } : {}) },

  /* ===== FILTERS ===== */
  filtersContainer: { paddingHorizontal: 24, gap: 8, paddingVertical: 16 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radii.full, borderWidth: 1, borderColor: 'transparent' },
  filterLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },

  /* ===== CARD ===== */
  card: { marginHorizontal: 24, marginBottom: 14, borderRadius: radii.lg, padding: 18, ...shadows.sm },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  cardLogo: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  cardLogoText: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: colors.white },
  cardCompanyArea: { flex: 1 },
  cardCompany: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.blue900, marginBottom: 2 },
  cardService: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600 },
  cardBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 5, paddingHorizontal: 10, borderRadius: radii.full },
  cardBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },

  /* Details */
  cardDetails: { gap: 6, marginBottom: 12 },
  cardDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardDetailText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600 },
  cardDetailDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.gray300, marginHorizontal: 4 },

  /* Price */
  cardPriceRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 },
  cardPrice: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: colors.accent, letterSpacing: -0.3 },

  /* Timeline */
  timelineWrap: { borderRadius: radii.sm, padding: 14, marginBottom: 12, gap: 0 },
  timelineStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  timelineIndicator: { alignItems: 'center', width: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.gray300, backgroundColor: colors.white, marginTop: 3 },
  timelineLine: { width: 1, flex: 1, backgroundColor: colors.gray100, marginVertical: 2 },
  timelineText: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, paddingTop: 2, flex: 1 },
  timelineCurrentBadge: { paddingHorizontal: 8, paddingVertical: 1, borderRadius: radii.full, marginTop: 2 },
  timelineCurrentText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: colors.accentDark },

  /* Notes */
  notesWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radii.sm, padding: 10, marginBottom: 12 },
  notesText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray600, flex: 1 },

  /* Actions */
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 7, paddingHorizontal: 12, borderRadius: radii.full, borderWidth: 1, borderColor: colors.gray100 },
  actionText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.accent },

  /* ===== EMPTY STATE ===== */
  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32, gap: 12 },
  emptyIconWrap: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.blue900, textAlign: 'center' },
  emptyDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray600, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 13, paddingHorizontal: 24, borderRadius: radii.full, marginTop: 8 },
  emptyBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.white },
});
