import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, Platform, TextInput } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { services, companies } from '../../src/constants/mockData';
import { formatCurrency, getStatusColor, getStatusLabel } from '../../src/utils/formatters';
import { colors, radii, shadows } from '../../src/theme';
import AppButton from '../../src/components/ui/AppButton';

const sortOptions = [
  { key: 'popular', label: 'Populares' },
  { key: 'rating', label: 'Calificación' },
  { key: 'price_asc', label: 'Menor precio' },
  { key: 'price_desc', label: 'Mayor precio' },
  { key: 'time', label: 'Más rápido' },
];

export default function ServicesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showSearch, setShowSearch] = useState(false);

  const categories = useMemo(() => {
    const tagSet = new Set(services.flatMap((s) => s.tags || []));
    return ['all', ...Array.from(tagSet)];
  }, []);

  const enrichedServices = useMemo(
    () =>
      services.map((service) => {
        const company = companies.find((c) => c.id === service.companyId);
        return {
          ...service,
          companyName: company?.name || 'Empresa',
          companyRating: company?.rating || 0,
        };
      }),
    []
  );

  const filtered = useMemo(() => {
    let result = enrichedServices;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.companyName.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q)
      );
    }

    if (activeCategory !== 'all') {
      result = result.filter((s) => (s.tags || []).includes(activeCategory));
    }

    switch (sortBy) {
      case 'rating':
        result = [...result].sort((a, b) => b.companyRating - a.companyRating);
        break;
      case 'price_asc':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'time':
        result = [...result].sort((a, b) => (a.timeEstimate || 0) - (b.timeEstimate || 0));
        break;
    }
    return result;
  }, [enrichedServices, searchQuery, activeCategory, sortBy]);

  const handleReserve = useCallback(
    (service) => {
      router.push({ pathname: '/(modals)/request-service', params: { id: service.id } });
    },
    [router]
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.gray50 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ===== HEADER ===== */}
        <View style={[styles.header, { backgroundColor: colors.white }]}>
          <Text style={styles.headerTitle}>Servicios</Text>
          <Text style={styles.headerSubtitle}>
            {filtered.length} servicio{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* ===== SEARCH ===== */}
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
              placeholder="Buscar servicios, empresas..."
              placeholderTextColor={colors.gray400}
              style={[styles.searchInput, { color: colors.gray900 }]}
              onBlur={() => {
                if (!searchQuery) setShowSearch(false);
              }}
            />
          ) : (
            <Text style={styles.searchPlaceholder}>Buscar servicios, empresas...</Text>
          )}
        </TouchableOpacity>

        {/* ===== CATEGORY CHIPS ===== */}
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

        {/* ===== SORT ROW ===== */}
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

        {/* ===== CARDS ===== */}
        <View style={styles.cardsList}>
          {filtered.map((service, index) => (
            <ServiceCardView
              key={service.id}
              service={service}
              index={index}
              onReserve={handleReserve}
            />
          ))}
          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Icon source="washing-machine" size={48} color={colors.gray300} />
              <Text style={styles.emptyTitle}>Sin resultados</Text>
              <Text style={styles.emptyDesc}>
                Intenta con otros filtros o términos de búsqueda.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function formatTime(minutes) {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h} horas`;
}

function ServiceCardView({ service, index, onReserve }) {
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

  const statusColor = getStatusColor(service.status?.toLowerCase());
  const statusLabel = getStatusLabel(service.status?.toLowerCase());

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View style={[styles.card, { backgroundColor: colors.white }]}>
        {/* IMAGE */}
        <View style={styles.cardImageWrap}>
          <Image source={{ uri: service.image }} style={styles.cardImage} />
          <View style={styles.cardImageOverlay} />
          <View style={[styles.statusBadge, { backgroundColor: statusColor + 'E6' }]}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: colors.white },
              ]}
            />
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        {/* BODY */}
        <View style={styles.cardBody}>
          {/* NAME + RATING */}
          <View style={styles.cardTopRow}>
            <Text style={styles.cardName} numberOfLines={1}>
              {service.name}
            </Text>
            <View style={styles.cardRatingRow}>
              <Icon source="star" size={14} color={colors.accent} />
              <Text style={styles.cardRating}>{service.companyRating}</Text>
            </View>
          </View>

          {/* COMPANY */}
          <Text style={styles.cardCompany}>{service.companyName}</Text>

          {/* INFO ROW */}
          <View style={styles.cardInfoRow}>
            <View style={styles.cardInfoItem}>
              <Icon source="map-marker" size={14} color={colors.gray400} />
              <Text style={styles.cardInfoText} numberOfLines={1}>
                {service.location.split('-')[0].trim()}
              </Text>
            </View>
            <View style={styles.cardInfoItem}>
              <Icon source="clock-outline" size={14} color={colors.gray400} />
              <Text style={styles.cardInfoText}>{formatTime(service.timeEstimate)}</Text>
            </View>
          </View>

          {/* PRICE */}
          <View style={styles.cardPriceRow}>
            <Text style={styles.cardPrice}>
              {formatCurrency(service.price)} <Text style={styles.cardPriceUnit}>/ hora</Text>
            </Text>
            {service.capacity && (
              <Text style={styles.cardCapacity}>Cap. {service.capacity}</Text>
            )}
          </View>

          {/* TAGS */}
          {service.tags && service.tags.length > 0 && (
            <View style={styles.cardTags}>
              {service.tags.slice(0, 3).map((tag) => (
                <View key={tag} style={[styles.tagChip, { backgroundColor: colors.accentTint }]}>
                  <Text style={[styles.tagLabel, { color: colors.accentDark }]}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* CTA */}
          <AppButton
            title="Reservar ahora"
            onPress={() => onReserve(service)}
            variant="primary"
            fullWidth
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 32,
  },

  /* HEADER */
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
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

  /* SEARCH */
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    paddingHorizontal: 18,
    height: 50,
    borderRadius: radii.full,
    marginBottom: 18,
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

  /* CHIPS */
  chipsScroll: {
    marginBottom: 12,
  },
  chipsContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },

  /* SORT */
  sortScroll: {
    marginBottom: 20,
  },
  sortContainer: {
    paddingHorizontal: 20,
    gap: 6,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.gray100,
    backgroundColor: colors.white,
  },
  sortLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },

  /* CARDS LIST */
  cardsList: {
    paddingHorizontal: 20,
    gap: 20,
  },

  /* CARD */
  card: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  cardImageWrap: {
    position: 'relative',
    height: 180,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: colors.white,
  },
  cardBody: {
    padding: 18,
    gap: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    color: colors.blue900,
    flex: 1,
    marginRight: 8,
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
  cardCompany: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.gray600,
    marginTop: -4,
  },
  cardInfoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  cardInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardInfoText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.gray600,
  },
  cardPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  cardPrice: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: colors.accent,
    letterSpacing: -0.3,
  },
  cardPriceUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.gray600,
  },
  cardCapacity: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.gray400,
  },
  cardTags: {
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

  /* EMPTY STATE */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: colors.blue900,
  },
  emptyDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.gray600,
    textAlign: 'center',
    maxWidth: 240,
  },
});
