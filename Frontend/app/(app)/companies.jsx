import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, TextInput, Platform } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { companies } from '../../src/constants/mockData';
import { formatCurrency, formatMinutes } from '../../src/utils/formatters';
import { colors, radii, shadows } from '../../src/theme';
import AppButton from '../../src/components/ui/AppButton';

const filterOptions = [
  { key: 'all', label: 'Todas' },
  { key: 'nearest', label: 'Más cercanas' },
  { key: 'top_rated', label: 'Mejor calificadas' },
  { key: 'express', label: 'Express' },
  { key: 'pickup', label: 'Recogida incluida' },
  { key: 'premium', label: 'Premium' },
  { key: 'open', label: 'Abiertas ahora' },
];

const LOGO_BG = [
  colors.accent,
  colors.blue700,
  colors.blue500,
  colors.accentDark,
  colors.blue900,
  colors.accent,
  colors.blue700,
  colors.gray600,
];

function getLogoBg(id) {
  return LOGO_BG[(id - 1) % LOGO_BG.length];
}

function SkeletonCard() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={[styles.card, styles.skeletonCard]}>
      <View style={styles.cardRow}>
        <Animated.View style={[styles.skelCircle, { opacity: pulse }]} />
        <View style={styles.skelTextBlock}>
          <Animated.View style={[styles.skelLine, { width: '70%', opacity: pulse }]} />
          <Animated.View style={[styles.skelLine, { width: '50%', opacity: pulse }]} />
          <Animated.View style={[styles.skelLine, { width: '60%', opacity: pulse }]} />
        </View>
      </View>
    </View>
  );
}

function MapPlaceholder({ companies, onBack }) {
  return (
    <View style={styles.mapWrap}>
      <View style={styles.mapBg}>
        {/* decorative pins */}
        <View style={[styles.mapPin, { top: '20%', left: '25%' }]} />
        <View style={[styles.mapPin, { top: '45%', left: '60%' }]} />
        <View style={[styles.mapPin, { top: '65%', left: '30%' }]} />
        <View style={[styles.mapPinSm, { top: '35%', left: '15%' }]} />
        <View style={[styles.mapPinSm, { top: '55%', left: '70%' }]} />
        <View style={[styles.mapPinSm, { top: '25%', left: '50%' }]} />

        {/* center card */}
        <View style={styles.mapCenter}>
          <Icon source="map-search-outline" size={48} color={colors.accent} />
          <Text style={styles.mapTitle}>Vista Mapa</Text>
          <Text style={styles.mapSub}>
            {companies.length} empresa{companies.length !== 1 ? 's' : ''} en Bogotá
          </Text>
          <Text style={styles.mapHint}>Los marcadores mostrarán las empresas cercanas a tu ubicación</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={onBack} style={styles.mapBackBtn}>
            <Icon source="format-list-bulleted" size={18} color={colors.white} />
            <Text style={styles.mapBackLabel}>Ver como lista</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

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
          </View>
          <View
            style={[
              styles.featuredStatus,
              { backgroundColor: company.isOpen ? colors.accentTint : colors.gray100 },
            ]}
          >
            <View
              style={[
                styles.featuredStatusDot,
                { backgroundColor: company.isOpen ? colors.accent : colors.gray400 },
              ]}
            />
            <Text
              style={[
                styles.featuredStatusText,
                { color: company.isOpen ? colors.accentDark : colors.gray600 },
              ]}
            >
              {company.isOpen ? 'Abierta' : 'Cerrada'}
            </Text>
          </View>
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

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={[styles.card, { backgroundColor: colors.white }]}>
        {/* top row: logo + name + rating */}
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
            <View style={styles.cardRatingRow}>
              <Icon source="star" size={14} color={colors.accent} />
              <Text style={styles.cardRating}>{company.rating}</Text>
              <Text style={styles.cardReviews}>
                · {company.reviewCount >= 1000
                  ? `${(company.reviewCount / 1000).toFixed(1)}k`
                  : company.reviewCount} reseñas
              </Text>
            </View>
          </View>
          {company.verified && (
            <View style={styles.verifiedBadge}>
              <Icon source="check-decagram" size={18} color={colors.accent} />
            </View>
          )}
        </View>

        {/* info chips row */}
        <View style={styles.cardChips}>
          <View style={styles.chipInfo}>
            <Icon source="map-marker" size={13} color={colors.gray400} />
            <Text style={styles.chipInfoText}>
              {company.location.split('-')[0].trim()} · {company.distance} km
            </Text>
          </View>
          <View style={styles.chipInfo}>
            <Icon source="clock-outline" size={13} color={colors.gray400} />
            <Text style={styles.chipInfoText}>~{formatMinutes(company.avgTime)}</Text>
          </View>
        </View>

        {/* price */}
        <Text style={styles.cardPrice}>
          Desde{' '}
          <Text style={styles.cardPriceValue}>{formatCurrency(company.minPrice)}</Text>
          <Text style={styles.cardPriceUnit}> / hora</Text>
        </Text>

        {/* tags */}
        {company.tags && company.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {company.tags.slice(0, 4).map((tag) => (
              <View key={tag} style={[styles.tagChip, { backgroundColor: colors.accentTint }]}>
                <Text style={[styles.tagLabel, { color: colors.accentDark }]}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* services */}
        <View style={styles.servicesRow}>
          {company.services.slice(0, 3).map((svc) => (
            <View key={svc} style={[styles.serviceChip, { backgroundColor: colors.gray50 }]}>
              <Text style={styles.serviceLabel}>{svc}</Text>
            </View>
          ))}
          {company.services.length > 3 && (
            <Text style={styles.serviceMore}>+{company.services.length - 3}</Text>
          )}
        </View>

        {/* CTA */}
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
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const featured = useMemo(
    () =>
      companies
        .filter((c) => c.isOpen)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3),
    []
  );

  const nearby = useMemo(
    () => [...companies].sort((a, b) => a.distance - b.distance),
    []
  );

  const filteredList = useMemo(() => {
    let result = [...companies];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.services.some((s) => s.toLowerCase().includes(q)) ||
          c.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (activeFilter !== 'all') {
      switch (activeFilter) {
        case 'express':
          result = result.filter((c) => c.tags?.includes('Express'));
          break;
        case 'pickup':
          result = result.filter(
            (c) =>
              c.tags?.includes('Recogida incluida') || c.tags?.includes('A domicilio')
          );
          break;
        case 'premium':
          result = result.filter((c) => c.tags?.includes('Premium'));
          break;
        case 'open':
          result = result.filter((c) => c.isOpen);
          break;
      }
    }

    switch (activeFilter) {
      case 'nearest':
        result.sort((a, b) => a.distance - b.distance);
        break;
      case 'top_rated':
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [searchQuery, activeFilter]);

  const isDefaultView = activeFilter === 'all' && !searchQuery.trim();
  const displayList = isDefaultView ? nearby : filteredList;

  const handleCompanyPress = useCallback(
    (company) => {
      router.push({ pathname: '/(modals)/company-detail', params: { id: company.id } });
    },
    [router]
  );

  const toggleViewMode = useCallback(() => {
    setViewMode((v) => (v === 'list' ? 'map' : 'list'));
  }, []);

  return (
    <View style={styles.screen}>
      {/* ===== HEADER ===== */}
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleArea}>
            <Text style={styles.headerTitle}>Empresas</Text>
            <Text style={styles.headerSubtitle}>
              {viewMode === 'list' ? 'Encuentra la empresa ideal' : 'Explora empresas en el mapa'}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleViewMode}
            style={[styles.viewToggle, { backgroundColor: colors.gray50 }]}
          >
            <Icon
              source={viewMode === 'list' ? 'map-outline' : 'format-list-bulleted'}
              size={20}
              color={colors.gray600}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== LIST MODE ===== */}
      {viewMode === 'list' ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
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
                placeholder="Buscar empresas, servicios..."
                placeholderTextColor={colors.gray400}
                style={[styles.searchInput, { color: colors.gray900 }]}
                onBlur={() => {
                  if (!searchQuery) setShowSearch(false);
                }}
              />
            ) : (
              <Text style={styles.searchPlaceholder}>Buscar empresas, servicios...</Text>
            )}
          </TouchableOpacity>

          {/* FILTER CHIPS */}
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

          {/* LOADING */}
          {isLoading ? (
            <View style={styles.skelList}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : (
            <>
              {/* FEATURED */}
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

              {/* RESULTS */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {isDefaultView ? 'Cercanas' : 'Resultados'}
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

                {/* EMPTY */}
                {displayList.length === 0 && (
                  <View style={styles.emptyState}>
                    <Icon source="store-search-outline" size={48} color={colors.gray300} />
                    <Text style={styles.emptyTitle}>Sin resultados</Text>
                    <Text style={styles.emptyDesc}>
                      No encontramos empresas con esos criterios. Intenta con otros filtros o una
                      búsqueda diferente.
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>
      ) : (
        /* ===== MAP MODE ===== */
        <MapPlaceholder companies={displayList} onBack={toggleViewMode} />
      )}
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

  /* ===== HEADER ===== */
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
  viewToggle: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  /* ===== SEARCH ===== */
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
    fontSize: 15,
    color: colors.gray400,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    padding: 0,
    margin: 0,
    outlineStyle: 'none',
    ...(Platform.OS === 'web' ? { outline: 'none' } : {}),
  },

  /* ===== FILTER CHIPS ===== */
  filtersScroll: {
    marginBottom: 4,
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

  /* ===== SKELETON ===== */
  skelList: {
    paddingHorizontal: 20,
    gap: 14,
    marginTop: 8,
  },
  skeletonCard: {
    padding: 16,
  },
  skelCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray100,
  },
  skelTextBlock: {
    flex: 1,
    marginLeft: 14,
    gap: 10,
    justifyContent: 'center',
  },
  skelLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.gray100,
  },

  /* ===== SECTIONS ===== */
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

  /* ===== FEATURED ===== */
  featuredContainer: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 4,
  },
  featuredCard: {
    width: 138,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    alignItems: 'center',
    gap: 8,
    ...shadows.sm,
  },
  featuredLogo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredLogoText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: colors.white,
  },
  featuredName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.blue900,
    textAlign: 'center',
    lineHeight: 16,
    height: 32,
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
  featuredStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  featuredStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  featuredStatusText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
  },

  /* ===== CARD ===== */
  card: {
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: radii.lg,
    padding: 18,
    gap: 12,
    ...shadows.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLogoImg: {
    width: 48,
    height: 48,
  },
  cardLogoText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: colors.white,
  },
  cardNameArea: {
    flex: 1,
  },
  cardName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: colors.blue900,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  cardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
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
  verifiedBadge: {
    marginLeft: 4,
  },

  /* ===== CARD INFO CHIPS ===== */
  cardChips: {
    flexDirection: 'row',
    gap: 16,
  },
  chipInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipInfoText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.gray600,
  },

  /* ===== CARD PRICE ===== */
  cardPrice: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.gray600,
  },
  cardPriceValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: colors.accent,
    letterSpacing: -0.3,
  },
  cardPriceUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.gray600,
  },

  /* ===== TAGS ===== */
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  tagLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },

  /* ===== SERVICES ===== */
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  serviceChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  serviceLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.gray600,
  },
  serviceMore: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: colors.gray400,
  },

  /* ===== MAP ===== */
  mapWrap: {
    flex: 1,
  },
  mapBg: {
    flex: 1,
    backgroundColor: colors.blue100,
    position: 'relative',
  },
  mapPin: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
    opacity: 0.35,
  },
  mapPinSm: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.blue700,
    opacity: 0.25,
  },
  mapCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 40,
  },
  mapTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: colors.blue900,
    marginTop: 4,
  },
  mapSub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.gray600,
  },
  mapHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.gray400,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
  mapBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.blue900,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radii.full,
    marginTop: 8,
  },
  mapBackLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.white,
  },

  /* ===== EMPTY STATE ===== */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    color: colors.blue900,
  },
  emptyDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});
