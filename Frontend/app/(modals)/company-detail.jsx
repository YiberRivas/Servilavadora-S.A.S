import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { companiesService } from '../../src/services/companies.service';
import { formatCurrency, formatMinutes } from '../../src/utils/formatters';
import { colors, radii, shadows } from '../../src/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LOGO_COLORS = ['#12A594', '#1F4E79', '#8b5cf6', '#f59e0b', '#ef4444', '#0ea5e9', '#10b981'];

function getLogoBg(id) {
  if (!id) return LOGO_COLORS[0];
  const idx = typeof id === 'string'
    ? id.charCodeAt(0) % LOGO_COLORS.length
    : id % LOGO_COLORS.length;
  return LOGO_COLORS[idx];
}

function mapBackendToDetail(e) {
  return {
    id: e.uuid,
    name: e.nombre_comercial,
    description: e.descripcion || 'Sin descripcion',
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
    minPrice: e.tarifa_min || 0,
    isOpen: true,
    verified: e.verified || false,
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
    sucursales: e.sucursales || [],
    info: {
      experience: '',
      avgClients: '',
      coverage: '',
      paymentMethods: ['Efectivo', 'Nequi'],
    },
  };
}

const reviewsData = [];

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

const CapacityCard = React.memo(function CapacityCard({ capacity, companyId, onNavigate }) {
  const isAvailable = capacity.available > 0;

  const handleOrderNow = () => {
    if (!isAvailable || !onNavigate) return;
    onNavigate(companyId, capacity.id, 'now');
  };

  const handleReserve = () => {
    if (!isAvailable || !onNavigate) return;
    onNavigate(companyId, capacity.id, 'reserva');
  };

  return (
    <View style={[styles.capacityCard, { backgroundColor: colors.white }]}>
      <View style={styles.capacityTop}>
        <View style={[styles.capacityIconWrap, { backgroundColor: colors.accentTint }]}>
          <Icon source="washing-machine" size={24} color={colors.accent} />
        </View>
        <View style={styles.capacityInfo}>
          <Text style={styles.capacityType}>{capacity.type}</Text>
          <Text style={styles.capacityKg}>{capacity.kg} kg</Text>
        </View>
        <View style={[styles.capacityStatusBadge, { backgroundColor: isAvailable ? colors.accentTint : '#FEF2F2' }]}>
          <Text style={[styles.capacityStatusText, { color: isAvailable ? colors.accentDark : colors.error }]}>
            {isAvailable ? `${capacity.available} disponibles` : 'Sin disponibilidad'}
          </Text>
        </View>
      </View>

      <View style={styles.capacityPriceRow}>
        <Text style={styles.capacityPrice}>Desde <Text style={styles.capacityPriceValue}>{formatCurrency(capacity.price)}</Text><Text style={styles.capacityPriceUnit}> / hora</Text></Text>
      </View>

      <View style={styles.capacityActions}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOrderNow}
          disabled={!isAvailable}
          style={[styles.capacityBtn, styles.capacityBtnPrimary, { backgroundColor: isAvailable ? colors.accent : colors.gray300 }]}
        >
          <Text style={[styles.capacityBtnText, { color: isAvailable ? colors.white : colors.gray600 }]}>Pedir ahora</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleReserve}
          disabled={!isAvailable}
          style={[styles.capacityBtn, styles.capacityBtnSecondary, { borderColor: isAvailable ? colors.accent : colors.gray300 }]}
        >
          <Text style={[styles.capacityBtnText, { color: isAvailable ? colors.accent : colors.gray400 }]}>Reservar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function CompanyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('recent');

  const loadCompany = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await companiesService.get(id);
      if (response.success && response.data) {
        setCompany(mapBackendToDetail(response.data));
      } else {
        setError('Empresa no encontrada');
      }
    } catch (err) {
      setError('Error al cargar la empresa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadCompany();
  }, [id]);

  const galleryImages = useMemo(() => {
    if (!company) return [];
    return [company.image].filter(Boolean);
  }, [company]);

  const sortedReviews = useMemo(() => {
    const reviews = [...reviewsData];
    if (reviewFilter === 'rating') {
      reviews.sort((a, b) => b.rating - a.rating);
    }
    return reviews;
  }, [reviewFilter]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.errorText}>Cargando empresa...</Text>
      </View>
    );
  }

  if (error || !company) {
    return (
      <View style={styles.center}>
        <Icon source="alert-circle-outline" size={48} color={colors.gray300} />
        <Text style={styles.errorText}>{error || 'Empresa no encontrada'}</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={loadCompany}
          style={{ marginTop: 12, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: colors.accent, borderRadius: radii.full }}
        >
          <Text style={{ color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 14 }}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.heroWrap}>
          {company.image ? (
            <Image source={{ uri: company.image }} style={styles.heroCover} />
          ) : (
            <View style={[styles.heroCover, { backgroundColor: getLogoBg(company.id) }]} />
          )}
          <View style={styles.heroOverlay} />
          <View style={styles.heroTopBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.heroBtn}>
              <Icon source="close" size={22} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.heroTopRight}>
              <TouchableOpacity onPress={() => setFavorite(!favorite)} style={styles.heroBtn}>
                <Icon source={favorite ? 'heart' : 'heart-outline'} size={22} color={favorite ? '#ef4444' : colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroBtn}>
                <Icon source="share-variant-outline" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.heroLogo, { backgroundColor: getLogoBg(company.id) }]}>
            <Text style={styles.heroLogoText}>{company.name.charAt(0)}</Text>
          </View>
        </View>

        <AnimatedSection delay={0}>
          <View style={[styles.infoCard, { backgroundColor: colors.white }]}>
            <View style={styles.infoTopRow}>
              <Text style={styles.infoName}>{company.name}</Text>
              {company.verified && (
                <View style={[styles.verBadge, { backgroundColor: colors.accentTint }]}>
                  <Icon source="check-decagram" size={13} color={colors.accent} />
                  <Text style={styles.verText}>Verificada</Text>
                </View>
              )}
            </View>
            <View style={styles.infoRatingRow}>
              <Icon source="star" size={16} color={colors.accent} />
              <Text style={styles.infoRating}>{company.rating}</Text>
              <Text style={styles.infoReviews}>({company.reviewCount} resenas)</Text>
              <Text style={styles.infoServicesCount}> · {company.servicesCount} servicios</Text>
            </View>
            <View style={styles.infoMetaRow}>
              <Icon source="map-marker-outline" size={14} color={colors.gray400} />
              <Text style={styles.infoMetaText}>{company.neighborhood || company.city} · {company.distance} km</Text>
              <View style={styles.metaDot} />
              <Icon source="clock-outline" size={14} color={colors.gray400} />
              <Text style={styles.infoMetaText}>~{formatMinutes(company.avgTime)}</Text>
            </View>
          </View>
        </AnimatedSection>

        <AnimatedSection delay={60}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryContainer}>
            {galleryImages.map((url, i) => (
              <Image key={`${url}-${i}`} source={{ uri: url }} style={[styles.galleryImg, i === 0 && { marginLeft: 24 }, i === galleryImages.length - 1 && { marginRight: 24 }]} />
            ))}
          </ScrollView>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <View style={[styles.sectionCard, { backgroundColor: colors.white }]}>
            <Text style={styles.sectionTitle}>Acerca de</Text>
            <Text style={styles.sectionBody}>{company.description}</Text>
            <View style={styles.tagRow}>
              {company.tags?.map((t) => (
                <View key={t} style={[styles.tag, { backgroundColor: colors.accentTint }]}>
                  <Text style={[styles.tagLabel, { color: colors.accentDark }]}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        </AnimatedSection>

        <AnimatedSection delay={140}>
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: 24 }]}>Capacidades disponibles</Text>
            <View style={styles.capacitiesList}>
              {company.capacities?.map((capacity) => (
                <CapacityCard
                  key={capacity.id}
                  capacity={capacity}
                  companyId={company.id}
                  onNavigate={(cid, capId, type) => router.push(`/(modals)/request-service?companyId=${cid}&capacityId=${capId}&requestType=${type}`)}
                />
              ))}
              {(!company.capacities || company.capacities.length === 0) && (
                <Text style={styles.emptyServices}>No hay capacidades disponibles</Text>
              )}
            </View>
          </View>
        </AnimatedSection>

        <AnimatedSection delay={180}>
          <View style={[styles.sectionCard, { backgroundColor: colors.white }]}>
            <Text style={styles.sectionTitle}>Por que elegir esta empresa</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoGridItem}>
                <Icon source="briefcase-outline" size={20} color={colors.accent} />
                <Text style={styles.infoGridLabel}>Experiencia</Text>
                <Text style={styles.infoGridValue}>{company.info?.experience || '-'}</Text>
              </View>
              <View style={styles.infoGridItem}>
                <Icon source="clock-fast" size={20} color={colors.accent} />
                <Text style={styles.infoGridLabel}>Tiempo promedio</Text>
                <Text style={styles.infoGridValue}>~{formatMinutes(company.avgTime)}</Text>
              </View>
              <View style={styles.infoGridItem}>
                <Icon source="account-group" size={20} color={colors.accent} />
                <Text style={styles.infoGridLabel}>Clientes</Text>
                <Text style={styles.infoGridValue}>{company.info?.avgClients || '-'}</Text>
              </View>
              <View style={styles.infoGridItem}>
                <Icon source="map-marker-distance" size={20} color={colors.accent} />
                <Text style={styles.infoGridLabel}>Cobertura</Text>
                <Text style={styles.infoGridValue}>{company.info?.coverage || '-'}</Text>
              </View>
            </View>
            <View style={styles.paymentRow}>
              <Icon source="credit-card-outline" size={18} color={colors.gray400} />
              <Text style={styles.paymentLabel}>Metodos de pago:</Text>
              <Text style={styles.paymentMethods}>{company.info?.paymentMethods?.join(', ') || '-'}</Text>
            </View>
          </View>
        </AnimatedSection>

        <AnimatedSection delay={220}>
          <View style={styles.sectionBlock}>
            <View style={[styles.reviewHeader, { paddingHorizontal: 24 }]}>
              <Text style={styles.sectionTitle}>Opiniones</Text>
              <View style={styles.reviewFilters}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setReviewFilter('recent')}
                  style={[styles.reviewFilterChip, reviewFilter === 'recent' && { backgroundColor: colors.accentTint }]}
                >
                  <Text style={[styles.reviewFilterText, reviewFilter === 'recent' && { color: colors.accentDark }]}>Mas recientes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setReviewFilter('rating')}
                  style={[styles.reviewFilterChip, reviewFilter === 'rating' && { backgroundColor: colors.accentTint }]}
                >
                  <Text style={[styles.reviewFilterText, reviewFilter === 'rating' && { color: colors.accentDark }]}>Mejor calificadas</Text>
                </TouchableOpacity>
              </View>
            </View>
            {sortedReviews.length === 0 ? (
              <View style={styles.emptyReviews}>
                <Icon source="comment-outline" size={32} color={colors.gray300} />
                <Text style={styles.emptyReviewsText}>No hay opiniones disponibles</Text>
              </View>
            ) : (
              sortedReviews.map((review) => (
                <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.white }]}>
                  <View style={styles.reviewTop}>
                    <View style={[styles.reviewAvatar, { backgroundColor: getLogoBg(review.id + 5) }]}>
                      <Text style={styles.reviewAvatarText}>{review.initials}</Text>
                    </View>
                    <View style={styles.reviewInfo}>
                      <Text style={styles.reviewName}>{review.name}</Text>
                      <View style={styles.reviewStars}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Icon key={i} source="star" size={12} color={i < review.rating ? '#f59e0b' : colors.gray100} />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                  <Text style={styles.reviewText}>{review.text}</Text>
                </View>
              ))
            )}
          </View>
        </AnimatedSection>

        <AnimatedSection delay={260}>
          <View style={[styles.sectionCard, { backgroundColor: colors.white }]}>
            <Text style={styles.sectionTitle}>Horario y ubicacion</Text>
            <View style={styles.schedRow}>
              <Icon source="clock-outline" size={16} color={colors.gray400} />
              <Text style={styles.schedText}>Lun - Vie: {company.schedule?.weekday || '8:00 - 20:00'}</Text>
            </View>
            <View style={styles.schedRow}>
              <Icon source="clock-outline" size={16} color={colors.gray400} />
              <Text style={styles.schedText}>Sab: {company.schedule?.saturday || '9:00 - 18:00'}</Text>
            </View>
            <View style={styles.schedRow}>
              <Icon source="clock-outline" size={16} color={colors.gray400} />
              <Text style={styles.schedText}>Dom: {company.schedule?.sunday || 'Cerrado'}</Text>
            </View>
            <View style={[styles.mapPlaceholder, { backgroundColor: colors.blue100 }]}>
              <Icon source="map-outline" size={32} color={colors.blue500} />
              <Text style={styles.mapText}>Ver en el mapa</Text>
              <Text style={styles.mapSubtext}>{company.location}</Text>
            </View>
            <View style={styles.contactRow}>
              <TouchableOpacity activeOpacity={0.7} style={styles.contactBtn}>
                <Icon source="phone-outline" size={18} color={colors.accent} />
                <Text style={styles.contactBtnText}>Llamar</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} style={styles.contactBtn}>
                <Icon source="email-outline" size={18} color={colors.accent} />
                <Text style={styles.contactBtnText}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedSection>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.white }]}>
        <View style={styles.bottomPrice}>
          <Text style={styles.bottomPriceValue}>{formatCurrency(company.minPrice)}</Text>
          <Text style={styles.bottomPriceLabel}>/ hora · {company.distance} km</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push({ pathname: '/(modals)/request-service', params: { companyId: company.id } })}
          style={[styles.bottomCta, { backgroundColor: colors.accent }]}
        >
          <Text style={styles.bottomCtaText}>Reservar ahora</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white, gap: 12 },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 16, color: colors.gray600 },

  heroWrap: { height: 240, position: 'relative' },
  heroCover: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  heroTopBar: { position: 'absolute', top: Platform.OS === 'ios' ? 56 : 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  heroBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  heroTopRight: { flexDirection: 'row', gap: 8 },
  heroLogo: { position: 'absolute', bottom: -32, left: 24, width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadows.md },
  heroLogoText: { fontFamily: 'Poppins_700Bold', fontSize: 30, color: colors.white },

  infoCard: { marginTop: 32, marginHorizontal: 24, borderRadius: radii.lg, padding: 20, ...shadows.sm },
  infoTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  infoName: { fontFamily: 'Poppins_600SemiBold', fontSize: 22, color: colors.blue900, flex: 1, marginRight: 8, letterSpacing: -0.3 },
  verBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 10, borderRadius: radii.full },
  verText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: colors.accentDark },
  infoRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  infoRating: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.blue900 },
  infoReviews: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray400 },
  infoServicesCount: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray400 },
  infoMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoMetaText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600 },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.gray300, marginHorizontal: 4 },

  galleryContainer: { paddingVertical: 16, gap: 8 },
  galleryImg: { width: 140, height: 100, borderRadius: radii.md },

  sectionCard: { marginHorizontal: 24, borderRadius: radii.lg, padding: 20, marginBottom: 16, ...shadows.sm },
  sectionBlock: { marginBottom: 16 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: colors.blue900, marginBottom: 12 },
  sectionBody: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray600, lineHeight: 22, marginBottom: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full },
  tagLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },

  capacitiesList: { paddingHorizontal: 24, gap: 12 },
  capacityCard: { borderRadius: radii.md, padding: 16, gap: 12, ...shadows.sm },
  capacityTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  capacityIconWrap: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  capacityInfo: { flex: 1 },
  capacityType: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.blue900, marginBottom: 2 },
  capacityKg: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600 },
  capacityStatusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radii.full },
  capacityStatusText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  capacityPriceRow: { paddingHorizontal: 4 },
  capacityPrice: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray600 },
  capacityPriceValue: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.accent },
  capacityPriceUnit: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray600 },
  capacityActions: { flexDirection: 'row', gap: 10 },
  capacityBtn: { flex: 1, paddingVertical: 12, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center' },
  capacityBtnPrimary: {},
  capacityBtnSecondary: { borderWidth: 1.5, backgroundColor: 'transparent' },
  capacityBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  infoGridItem: { width: (SCREEN_WIDTH - 96) / 2, backgroundColor: colors.gray50, borderRadius: radii.md, padding: 14, gap: 6 },
  infoGridLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray400 },
  infoGridValue: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.blue900 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.gray100 },
  paymentLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray400 },
  paymentMethods: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.blue900, flex: 1 },

  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reviewFilters: { flexDirection: 'row', gap: 6 },
  reviewFilterChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radii.full },
  reviewFilterText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.gray400 },
  reviewCard: { marginHorizontal: 24, marginTop: 10, borderRadius: radii.md, padding: 16, ...shadows.sm },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.white },
  reviewInfo: { flex: 1 },
  reviewName: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.blue900 },
  reviewStars: { flexDirection: 'row', gap: 1, marginTop: 2 },
  reviewDate: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray400 },
  reviewText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600, lineHeight: 19 },

  schedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  schedText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600 },
  mapPlaceholder: { borderRadius: radii.md, padding: 24, alignItems: 'center', gap: 6, marginBottom: 14, marginTop: 4 },
  mapText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.blue700 },
  mapSubtext: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.blue500 },
  contactRow: { flexDirection: 'row', gap: 12 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16, borderRadius: radii.full, borderWidth: 1, borderColor: colors.gray100, flex: 1, justifyContent: 'center' },
  contactBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.accent },

  emptyReviews: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyReviewsText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray400 },
  emptyServices: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray400, textAlign: 'center', paddingVertical: 20 },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 32 : 12, borderTopWidth: 1, borderTopColor: colors.gray100 },
  bottomPrice: { flex: 1 },
  bottomPriceValue: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: colors.accent, letterSpacing: -0.3 },
  bottomPriceLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray400, marginTop: 1 },
  bottomCta: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: radii.full },
  bottomCtaText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.white },
});