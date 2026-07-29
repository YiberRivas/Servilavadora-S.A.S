import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, TextInput, Platform, RefreshControl } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { companiesService } from '../../src/services';
import { formatMinutes } from '../../src/utils/formatters';
import { colors, radii, shadows } from '../../src/theme';
import AppButton from '../../src/components/ui/AppButton';
import SkeletonCard from '../../src/components/ui/SkeletonCard';

const LOGO_COLORS = ['#12A594', '#1F4E79', '#8b5cf6', '#f59e0b', '#ef4444', '#0ea5e9', '#10b981'];

function getLogoBg(id) {
  if (!id) return LOGO_COLORS[0];
  const idx = typeof id === 'string'
    ? id.charCodeAt(0) % LOGO_COLORS.length
    : id % LOGO_COLORS.length;
  return LOGO_COLORS[idx];
}

function mapBackendToUI(e) {
  return {
    id: e.uuid,
    name: e.nombre_comercial,
    description: e.descripcion || '',
    image: e.logo || null,
    neighborhood: e.neighborhood || '',
    city: e.city || '',
    location: e.direccion_completa || '',
    phone: e.telefono,
    email: e.correo,
    rating: 0,
    reviewCount: 0,
    distance: 0,
    avgTime: 45,
    minPrice: e.tarifa_min || 3500,
    isOpen: true,
    verified: e.verified || false,
    servicesCount: e.total_lavadoras || 0,
    tags: [
      e.verified && 'Verificada',
      e.permite_reservas && 'Acepta reservas',
    ].filter(Boolean),
    capacities: (e.capacities || []).map((c, i) => ({
      id: `${e.uuid}-${i}`,
      type: c.type || 'Lavadora',
      kg: c.kg,
      available: c.available,
      price: c.price,
      status: c.available > 0 ? 'Disponible' : 'Sin disponibilidad',
    })),
    schedule: { weekday: '8:00 - 20:00', saturday: '9:00 - 18:00', sunday: 'Cerrado' },
    info: {
      experience: '',
      avgClients: '',
      coverage: '',
      paymentMethods: ['Efectivo', 'Nequi'],
    },
  };
}

const filterOptions = [
  { key: 'all', label: 'Todas' },
  { key: 'nearest', label: 'Cercanas' },
  { key: 'top_rated', label: 'Mejor calificadas' },
  { key: 'open', label: 'Disponibles ahora' },
  { key: 'accepts_booking', label: 'Aceptan reservas' },
  { key: 'express', label: 'Express' },
  { key: 'traditional', label: 'Lavado tradicional' },
];

const sortOptions = [
  { key: 'rating', label: 'Calificacion' },
  { key: 'price_asc', label: 'Menor precio' },
  { key: 'price_desc', label: 'Mayor precio' },
  { key: 'distance', label: 'Distancia' },
  { key: 'availability', label: 'Disponibilidad' },
];

function FeaturedCard({ company, onPress, index }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 400,
      delay: index * 120,
      useNativeDriver: true,
    }).start();
  }, []);

  const availableCapacities = company.capacities?.filter(c => c.available > 0) || [];

  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
      <TouchableOpacity activeOpacity={0.7} onPress={() => onPress(company)}>
        <View style={[styles.featuredCard, { backgroundColor: colors.white }]}>
          <View style={[styles.featuredLogo, { backgroundColor: getLogoBg(company.id) }]}>
            <Text style={styles.featuredLogoText}>{company.name.charAt(0)}</Text>
          </View>
          <Text style={styles.featuredName} numberOfLines={2}>
            {company.name}
          </Text>
          <View style={styles.featuredRating}>
            <Icon source="star" size={12} color={colors.accent} />
            <Text style={styles.featuredRatingText}>{company.rating}</Text>
            <Text style={styles.featuredReviews}>({company.reviewCount})</Text>
          </View>
          <Text style={styles.featuredCity} numberOfLines={1}>
            {company.neighborhood || company.city}
          </Text>
          <View style={styles.featuredCapacities}>
            {availableCapacities.slice(0, 3).map((cap) => (
              <View key={cap.id} style={[styles.capacityPill, { backgroundColor: colors.accentTint }]}>
                <Text style={styles.capacityText}>{cap.kg}kg</Text>
              </View>
            ))}
          </View>
          <View style={styles.featuredTimeRow}>
            <Icon source="clock-outline" size={11} color={colors.gray400} />
            <Text style={styles.featuredTime}>~{formatMinutes(company.avgTime)}</Text>
          </View>
          <AppButton title="Ver empresa" onPress={() => onPress(company)} variant="outline" fullWidth />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function CompanyCardView({ company, onPress, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const availableCapacities = company.capacities?.filter(c => c.available > 0) || [];
  const hasAvailability = availableCapacities.length > 0;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={[styles.card, { backgroundColor: colors.white }]}>
        <View style={styles.cardRow}>
          <View style={[styles.cardLogo, { backgroundColor: getLogoBg(company.id) }]}>
            {company.image ? (
              <Image source={{ uri: company.image }} style={styles.cardLogoImg} />
            ) : (
              <Text style={styles.cardLogoText}>{company.name.charAt(0)}</Text>
            )}
          </View>
          <View style={styles.cardNameArea}>
            <Text style={styles.cardName} numberOfLines={1}>
              {company.name}
            </Text>
            <View style={styles.cardLocationRow}>
              <Icon source="map-marker" size={12} color={colors.gray400} />
              <Text style={styles.cardLocationText} numberOfLines={1}>
                {company.neighborhood || company.city} · {company.distance} km
              </Text>
            </View>
          </View>
          {company.verified && (
            <View style={styles.verifiedBadge}>
              <Icon source="check-decagram" size={18} color={colors.accent} />
            </View>
          )}
        </View>

        <View style={styles.cardRatingRow}>
          <Icon source="star" size={14} color={colors.accent} />
          <Text style={styles.cardRating}>{company.rating}</Text>
          <Text style={styles.cardReviews}>
            · {company.reviewCount >= 1000
              ? `${(company.reviewCount / 1000).toFixed(1)}k`
              : company.reviewCount} resenas
          </Text>
          <Text style={styles.cardServicesCount}> · {company.servicesCount} servicios</Text>
        </View>

        <View style={styles.cardScheduleRow}>
          <Icon source="clock-outline" size={13} color={colors.gray400} />
          <Text style={styles.cardScheduleText}>{company.schedule?.weekday || 'Horario variable'}</Text>
        </View>

        {availableCapacities.length > 0 && (
          <View style={styles.cardCapacitiesRow}>
            <Text style={styles.cardCapacitiesLabel}>Capacidades:</Text>
            <View style={styles.cardCapacitiesList}>
              {availableCapacities.map((cap) => (
                <View key={cap.id} style={[styles.capacityTag, { backgroundColor: colors.accentTint }]}>
                  <Text style={styles.capacityTagText}>{cap.kg}kg</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.cardAvailabilityRow}>
          <View style={[styles.availabilityDot, { backgroundColor: hasAvailability ? colors.accent : colors.error }]} />
          <Text style={[styles.availabilityText, { color: hasAvailability ? colors.accentDark : colors.error }]}>
            {hasAvailability ? 'Disponible ahora' : 'Proxima disponibilidad'}
          </Text>
        </View>

        <AppButton
          title="Ver empresa"
          onPress={() => onPress(company)}
          variant="outline"
          fullWidth
        />
      </View>
    </Animated.View>
  );
}

export default function CompaniesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSort, setActiveSort] = useState('rating');
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
        setCompaniesData(response.data.map(mapBackendToUI));
      } else {
        setCompaniesData([]);
      }
    } catch (err) {
      setError('No se pudieron cargar las empresas. Verifica tu conexion.');
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

  const featured = useMemo(
    () =>
      companiesData
        .filter((c) => c.isOpen && c.rating >= 4.5)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3),
    [companiesData]
  );

  const filteredList = useMemo(() => {
    let result = [...companiesData];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.neighborhood?.toLowerCase().includes(q) ||
          c.city?.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.tags?.some((t) => t.toLowerCase().includes(q)) ||
          c.capacities?.some((cap) => `${cap.kg}`.includes(q))
      );
    }

    if (activeFilter !== 'all') {
      switch (activeFilter) {
        case 'open':
          result = result.filter((c) => c.isOpen);
          break;
        case 'accepts_booking':
          result = result.filter((c) => c.tags?.includes('Acepta reservas'));
          break;
        case 'express':
          result = result.filter((c) => c.tags?.includes('Express'));
          break;
        case 'traditional':
          result = result.filter((c) => c.tags?.some(t => t.toLowerCase().includes('tradicional')));
          break;
      }
    }

    switch (activeSort) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'price_asc':
        result.sort((a, b) => a.minPrice - b.minPrice);
        break;
      case 'price_desc':
        result.sort((a, b) => b.minPrice - a.minPrice);
        break;
      case 'distance':
        result.sort((a, b) => a.distance - b.distance);
        break;
      case 'availability':
        result.sort((a, b) => {
          const aAvail = a.capacities?.filter(c => c.available > 0).length || 0;
          const bAvail = b.capacities?.filter(c => c.available > 0).length || 0;
          return bAvail - aAvail;
        });
        break;
    }

    if (activeFilter === 'nearest') {
      result.sort((a, b) => a.distance - b.distance);
    } else if (activeFilter === 'top_rated') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [companiesData, searchQuery, activeFilter, activeSort]);

  const isDefaultView = activeFilter === 'all' && !searchQuery.trim();
  const displayList = isDefaultView ? companiesData : filteredList;

  const handleCompanyPress = useCallback(
    (company) => {
      router.push({ pathname: '/(modals)/company-detail', params: { id: company.id } });
    },
    [router]
  );

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setActiveFilter('all');
    setActiveSort('rating');
  }, []);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleArea}>
            <Text style={styles.headerTitle}>Empresas</Text>
            <Text style={styles.headerSubtitle}>
              Encuentra la empresa ideal para ti
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} tintColor={colors.accent} />
        }
      >
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
              placeholder="Buscar por nombre, barrio, capacidad, servicio..."
              placeholderTextColor={colors.gray400}
              style={[styles.searchInput, { color: colors.gray900 }]}
              onBlur={() => {
                if (!searchQuery) setShowSearch(false);
              }}
            />
          ) : (
            <Text style={styles.searchPlaceholder}>Buscar por nombre, barrio, capacidad, servicio...</Text>
          )}
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
          style={styles.filtersScroll}
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

        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Ordenar por:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortContainer}>
            {sortOptions.map((opt) => {
              const isActive = activeSort === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  activeOpacity={0.7}
                  onPress={() => setActiveSort(opt.key)}
                  style={[
                    styles.sortChip,
                    isActive && { backgroundColor: colors.accentTint, borderColor: colors.accent },
                  ]}
                >
                  <Text style={[styles.sortChipText, isActive && { color: colors.accentDark }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.skelList}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconWrap, { backgroundColor: colors.gray50 }]}>
              <Icon source="cloud-off-outline" size={48} color={colors.gray300} />
            </View>
            <Text style={styles.emptyTitle}>Error de conexion</Text>
            <Text style={styles.emptyDesc}>{error}</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={loadCompanies}
              style={[styles.emptyBtn, { backgroundColor: colors.accent }]}
            >
              <Icon source="refresh" size={18} color={colors.white} />
              <Text style={styles.emptyBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {isDefaultView && featured.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Destacadas</Text>
                  <Text style={styles.sectionHint}>Las mejores calificadas</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.featuredContainer}
                >
                  {featured.map((c, i) => (
                    <FeaturedCard key={c.id} company={c} index={i} onPress={handleCompanyPress} />
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {isDefaultView ? 'Todas las empresas' : 'Resultados'}
                </Text>
                <Text style={styles.sectionHint}>
                  {displayList.length} empresa{displayList.length !== 1 ? 's' : ''}
                </Text>
              </View>

              {displayList.map((company, index) => (
                <CompanyCardView
                  key={company.id}
                  company={company}
                  index={index}
                  onPress={handleCompanyPress}
                />
              ))}

              {displayList.length === 0 && (
                <View style={styles.emptyState}>
                  <View style={[styles.emptyIconWrap, { backgroundColor: colors.gray50 }]}>
                    <Icon source="store-search-outline" size={48} color={colors.gray300} />
                  </View>
                  <Text style={styles.emptyTitle}>Sin resultados</Text>
                  <Text style={styles.emptyDesc}>
                    No encontramos empresas con esos criterios. Intenta con otros filtros o una busqueda diferente.
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleClearFilters}
                    style={[styles.emptyBtn, { backgroundColor: colors.accent }]}
                  >
                    <Icon source="filter-remove" size={18} color={colors.white} />
                    <Text style={styles.emptyBtnText}>Limpiar filtros</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitleArea: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 26,
    color: colors.blue900,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.gray600,
  },

  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    paddingHorizontal: 18,
    height: 50,
    borderRadius: radii.full,
    marginBottom: 14,
    ...shadows.lg,
  },
  searchPlaceholder: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.gray400,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    padding: 0,
    margin: 0,
    outlineStyle: 'none',
    ...(Platform.OS === 'web' ? { outline: 'none' } : {}),
  },

  filtersScroll: {
    marginBottom: 8,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },

  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  sortLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.gray600,
  },
  sortContainer: {
    gap: 6,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.gray100,
    backgroundColor: colors.white,
  },
  sortChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: colors.gray600,
  },

  skelList: {
    paddingHorizontal: 20,
    gap: 14,
    marginTop: 8,
  },

  section: {
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: colors.blue900,
  },
  sectionHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.gray600,
  },

  featuredContainer: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 4,
  },
  featuredCard: {
    width: 160,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    alignItems: 'center',
    gap: 6,
    ...shadows.sm,
  },
  featuredLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredLogoText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: colors.white,
  },
  featuredName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.blue900,
    textAlign: 'center',
    lineHeight: 18,
    height: 36,
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  featuredRatingText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: colors.blue900,
  },
  featuredReviews: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: colors.gray400,
  },
  featuredCity: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.gray400,
    textAlign: 'center',
  },
  featuredCapacities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
  capacityPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  capacityText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: colors.accentDark,
  },
  featuredTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  featuredTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.gray400,
  },

  card: {
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: radii.lg,
    padding: 16,
    gap: 10,
    ...shadows.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLogoImg: {
    width: 52,
    height: 52,
  },
  cardLogoText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: colors.white,
  },
  cardNameArea: {
    flex: 1,
  },
  cardName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: colors.blue900,
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardLocationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.gray600,
    flex: 1,
  },
  verifiedBadge: {
    marginLeft: 4,
  },

  cardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardRating: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.blue900,
  },
  cardReviews: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.gray400,
  },
  cardServicesCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.gray400,
  },

  cardScheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardScheduleText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.gray600,
  },

  cardCapacitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardCapacitiesLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.gray600,
  },
  cardCapacitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  capacityTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  capacityTagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: colors.accentDark,
  },

  cardAvailabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: colors.blue900,
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: radii.full,
    marginTop: 8,
  },
  emptyBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.white,
  },
});