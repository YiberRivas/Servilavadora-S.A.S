import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform, TextInput, RefreshControl } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { companiesService } from '../../src/services/companies.service';
import { formatCurrency } from '../../src/utils/formatters';
import { colors, radii, shadows } from '../../src/theme';
import AppButton from '../../src/components/ui/AppButton';
import SkeletonCard from '../../src/components/ui/SkeletonCard';

const LOGO_COLORS = ['#12A594', '#1F4E79', '#8b5cf6', '#f59e0b', '#ef4444', '#0ea5e9', '#10b981'];

function getLogoBg(uuid) {
  if (!uuid) return LOGO_COLORS[0];
  return LOGO_COLORS[uuid.charCodeAt(0) % LOGO_COLORS.length];
}

const sortOptions = [
  { key: 'popular', label: 'Populares' },
  { key: 'price_asc', label: 'Menor precio' },
  { key: 'price_desc', label: 'Mayor precio' },
  { key: 'availability', label: 'Disponibilidad' },
];

export default function ServicesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showSearch, setShowSearch] = useState(false);
  const [companiesData, setCompaniesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadCompanies = useCallback(async () => {
    try {
      setError(null);
      const response = await companiesService.list();
      if (response.success && response.data) {
        setCompaniesData(response.data);
      } else {
        setCompaniesData([]);
      }
    } catch (err) {
      setError('No se pudieron cargar los servicios.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCompanies();
  }, [loadCompanies]);

  const allServices = useMemo(() => {
    const services = [];
    companiesData.forEach((company) => {
      (company.capacities || []).forEach((cap, i) => {
        services.push({
          id: `${company.uuid}-${i}`,
          companyUuid: company.uuid,
          companyName: company.nombre_comercial || 'Empresa',
          name: cap.type || `Lavadora ${cap.kg}kg`,
          description: `Lavadora de ${cap.kg}kg disponible en ${company.nombre_comercial}`,
          kg: cap.kg,
          price: cap.price || 0,
          available: cap.available || 0,
          neighborhood: company.neighborhood || '',
          city: company.city || '',
          verified: company.verified || false,
          permite_reservas: company.permite_reservas || false,
          tarifa_min: company.tarifa_min || 0,
          tarifa_max: company.tarifa_max || 0,
        });
      });
    });
    return services;
  }, [companiesData]);

  const categories = useMemo(() => {
    const kgSet = new Set(allServices.map((s) => `${s.kg}kg`));
    return ['all', ...Array.from(kgSet).sort((a, b) => Number(a) - Number(b))];
  }, [allServices]);

  const filtered = useMemo(() => {
    let result = allServices;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.companyName.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          `${s.kg}`.includes(q)
      );
    }

    if (activeCategory !== 'all') {
      result = result.filter((s) => `${s.kg}kg` === activeCategory);
    }

    switch (sortBy) {
      case 'price_asc':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'availability':
        result = [...result].sort((a, b) => b.available - a.available);
        break;
    }
    return result;
  }, [allServices, searchQuery, activeCategory, sortBy]);

  const handleReserve = useCallback(
    (service) => {
      router.push({ pathname: '/(modals)/request-service', params: { companyId: service.companyUuid } });
    },
    [router]
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.gray50 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} tintColor={colors.accent} />
        }
      >
        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: colors.white }]}>
          <Text style={styles.headerTitle}>Servicios</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? 'Cargando...' : `${filtered.length} servicio${filtered.length !== 1 ? 's' : ''} disponible${filtered.length !== 1 ? 's' : ''}`}
          </Text>
        </View>

        {/* SEARCH */}
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
              placeholder="Buscar por empresa, capacidad..."
              placeholderTextColor={colors.gray400}
              style={[styles.searchInput, { color: colors.gray900 }]}
              onBlur={() => {
                if (!searchQuery) setShowSearch(false);
              }}
            />
          ) : (
            <Text style={styles.searchPlaceholder}>Buscar por empresa, capacidad...</Text>
          )}
        </TouchableOpacity>

        {/* CATEGORY CHIPS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
          style={styles.chipsScroll}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const label = cat === 'all' ? 'Todos' : cat;
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.7}
                onPress={() => setActiveCategory(cat)}
                style={[
                  styles.chip,
                  isActive
                    ? { backgroundColor: colors.accent }
                    : { backgroundColor: colors.white, borderColor: colors.gray100 },
                ]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    isActive ? { color: colors.white } : { color: colors.gray600 },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* SORT ROW */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortContainer}
          style={styles.sortScroll}
        >
          {sortOptions.map((opt) => {
            const isActive = sortBy === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                activeOpacity={0.7}
                onPress={() => setSortBy(opt.key)}
                style={[
                  styles.sortChip,
                  isActive && { borderColor: colors.accent },
                ]}
              >
                <Icon
                  source={isActive ? 'check-circle' : 'circle-outline'}
                  size={14}
                  color={isActive ? colors.accent : colors.gray400}
                />
                <Text
                  style={[
                    styles.sortLabel,
                    isActive ? { color: colors.accent } : { color: colors.gray600 },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* CARDS */}
        <View style={styles.cardsList}>
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : error ? (
            <View style={styles.emptyState}>
              <Icon source="cloud-off-outline" size={48} color={colors.gray300} />
              <Text style={styles.emptyTitle}>Error de conexion</Text>
              <Text style={styles.emptyDesc}>{error}</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={loadCompanies}
                style={[styles.retryBtn, { backgroundColor: colors.accent }]}
              >
                <Icon source="refresh" size={16} color={colors.white} />
                <Text style={styles.retryBtnText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon source="washing-machine" size={48} color={colors.gray300} />
              <Text style={styles.emptyTitle}>Sin resultados</Text>
              <Text style={styles.emptyDesc}>
                Intenta con otros filtros o terminos de busqueda.
              </Text>
            </View>
          ) : (
            filtered.map((service, index) => (
              <ServiceCardView
                key={service.uuid || service.id || index}
                service={service}
                index={index}
                onReserve={handleReserve}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function ServiceCardView({ service, index, onReserve }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: Math.min(index, 5) * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: Math.min(index, 5) * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isAvailable = service.available > 0;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View style={[styles.card, { backgroundColor: colors.white }]}>
        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <View style={[styles.cardLogo, { backgroundColor: getLogoBg(service.companyUuid) }]}>
              <Text style={styles.cardLogoText}>{service.companyName.charAt(0)}</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName} numberOfLines={1}>
                {service.name}
              </Text>
              <Text style={styles.cardCompany} numberOfLines={1}>{service.companyName}</Text>
            </View>
            {service.verified && (
              <Icon source="check-decagram" size={18} color={colors.accent} />
            )}
          </View>

          <View style={styles.cardMetaRow}>
            <View style={styles.cardMetaItem}>
              <Icon source="map-marker" size={14} color={colors.gray400} />
              <Text style={styles.cardMetaText} numberOfLines={1}>
                {service.neighborhood || service.city || 'Sin ubicacion'}
              </Text>
            </View>
            <View style={styles.cardMetaItem}>
              <Icon source="weight-kilogram" size={14} color={colors.gray400} />
              <Text style={styles.cardMetaText}>{service.kg} kg</Text>
            </View>
          </View>

          <View style={styles.cardBottomRow}>
            <View>
              <Text style={styles.cardPrice}>
                {service.price > 0 ? formatCurrency(service.price) : 'Consultar'}
              </Text>
              <Text style={styles.cardPriceUnit}>/ hora</Text>
            </View>
            <View style={[styles.availabilityBadge, { backgroundColor: isAvailable ? colors.accentTint : '#FEF2F2' }]}>
              <View style={[styles.availabilityDot, { backgroundColor: isAvailable ? colors.accent : colors.error }]} />
              <Text style={[styles.availabilityText, { color: isAvailable ? colors.accentDark : colors.error }]}>
                {isAvailable ? `${service.available} disp.` : 'Sin disp.'}
              </Text>
            </View>
          </View>

          <AppButton
            title="Reservar ahora"
            onPress={() => onReserve(service)}
            variant="primary"
            fullWidth
            disabled={!isAvailable}
            icon="calendar-check"
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingBottom: 32 },

  header: {
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold', fontSize: 26, color: colors.blue900,
    letterSpacing: -0.4, marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray600,
  },

  searchPill: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 20, paddingHorizontal: 18, height: 50,
    borderRadius: radii.full, marginBottom: 18, ...shadows.lg,
  },
  searchPlaceholder: {
    fontFamily: 'Inter_400Regular', fontSize: 15, color: colors.gray400, flex: 1,
  },
  searchInput: {
    flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15,
    padding: 0, margin: 0,
  },

  chipsScroll: { marginBottom: 12 },
  chipsContainer: { paddingHorizontal: 20, gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: radii.full, borderWidth: 1, borderColor: 'transparent',
  },
  chipLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },

  sortScroll: { marginBottom: 20 },
  sortContainer: { paddingHorizontal: 20, gap: 6 },
  sortChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: radii.full, borderWidth: 1,
    borderColor: colors.gray100, backgroundColor: colors.white,
  },
  sortLabel: { fontFamily: 'Inter_500Medium', fontSize: 12 },

  cardsList: { paddingHorizontal: 20, gap: 14 },

  card: { borderRadius: radii.lg, overflow: 'hidden', ...shadows.sm },
  cardBody: { padding: 16, gap: 10 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardLogo: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  cardLogoText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.white },
  cardInfo: { flex: 1 },
  cardName: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: colors.blue900, letterSpacing: -0.2 },
  cardCompany: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray600, marginTop: 1 },

  cardMetaRow: { flexDirection: 'row', gap: 16 },
  cardMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray600 },

  cardBottomRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  cardPrice: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.accent },
  cardPriceUnit: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray600 },
  availabilityBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: radii.full,
  },
  availabilityDot: { width: 6, height: 6, borderRadius: 3 },
  availabilityText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.blue900 },
  emptyDesc: {
    fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray600,
    textAlign: 'center', maxWidth: 240,
  },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: radii.full,
  },
  retryBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.white },
});
