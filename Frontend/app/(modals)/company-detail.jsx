import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, Dimensions, Platform } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { companies, services } from '../../src/constants/mockData';
import { formatCurrency, formatMinutes } from '../../src/utils/formatters';
import { colors, radii, shadows } from '../../src/theme';
import AppButton from '../../src/components/ui/AppButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LOGO_BG = [colors.accent, colors.blue700, colors.blue500, colors.accentDark, colors.blue900, colors.accent, colors.blue700, colors.gray600];

function getAllImages(company) {
  const pool = [
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=500&q=80',
  ];
  return [company.image, ...pool.filter((u) => u !== company.image)].slice(0, 5);
}

const trustIndicators = [
  { icon: 'check-decagram', label: 'Empresa verificada', color: colors.accent },
  { icon: 'star-circle', label: '4.8 calificación promedio', color: '#f59e0b' },
  { icon: 'flash-outline', label: 'Respuesta en minutos', color: '#3b82f6' },
  { icon: 'calendar-check', label: 'Mismo día disponible', color: '#10b981' },
];

const mockReviews = [
  { id: 1, name: 'Ana García', initials: 'AG', rating: 5, text: 'Excelente servicio. La lavadora quedó como nueva y el personal fue muy amable. Definitivamente volveré a reservar.', date: 'Hace 2 días' },
  { id: 2, name: 'Carlos Mendoza', initials: 'CM', rating: 4, text: 'Muy buen servicio, todo puntual. La única mejora sería tener más horarios disponibles los fines de semana.', date: 'Hace 1 semana' },
  { id: 3, name: 'María Torres', initials: 'MT', rating: 5, text: 'Llevo usando sus servicios desde hace 3 meses y nunca he tenido problemas. Súper recomendados.', date: 'Hace 2 semanas' },
];

function getLogoBg(id) {
  return LOGO_BG[((id || 1) - 1) % LOGO_BG.length];
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

export default function CompanyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const company = companies.find((c) => c.id === Number(id));

  const companyServices = useMemo(() => services.filter((s) => s.companyId === Number(id)), [id]);
  const galleryImages = useMemo(() => (company ? getAllImages(company) : []), [company]);
  const [favorite, setFavorite] = useState(false);

  if (!company) {
    return (
      <View style={styles.center}>
        <Icon source="alert-circle-outline" size={48} color={colors.gray300} />
        <Text style={styles.errorText}>Empresa no encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* ===== HERO ===== */}
        <View style={styles.heroWrap}>
          <Image source={{ uri: company.image }} style={styles.heroCover} />
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

        {/* ===== COMPANY INFO ===== */}
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
              <Text style={styles.infoReviews}>({company.reviewCount || 245} reseñas)</Text>
            </View>
            <View style={styles.infoMetaRow}>
              <Icon source="map-marker-outline" size={14} color={colors.gray400} />
              <Text style={styles.infoMetaText}>{company.location?.split('-')[0]?.trim() || 'Bogotá'} · {company.distance || 1.2} km</Text>
              <View style={styles.metaDot} />
              <Icon source="clock-outline" size={14} color={colors.gray400} />
              <Text style={styles.infoMetaText}>~{formatMinutes(company.avgTime || 45)}</Text>
            </View>
            <Text style={styles.infoPrice}>Desde <Text style={styles.infoPriceValue}>{formatCurrency(company.minPrice || 2500)}</Text><Text style={styles.infoPriceUnit}> / hora</Text></Text>
          </View>
        </AnimatedSection>

        {/* ===== GALLERY ===== */}
        <AnimatedSection delay={60}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryContainer}>
            {galleryImages.map((url, i) => (
              <Image key={i} source={{ uri: url }} style={[styles.galleryImg, i === 0 && { marginLeft: 24 }, i === galleryImages.length - 1 && { marginRight: 24 }]} />
            ))}
          </ScrollView>
        </AnimatedSection>

        {/* ===== DESCRIPTION ===== */}
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

        {/* ===== TRUST ===== */}
        <AnimatedSection delay={140}>
          <View style={styles.trustGrid}>
            {trustIndicators.map((item, i) => (
              <View key={i} style={[styles.trustCard, { backgroundColor: colors.white }]}>
                <Icon source={item.icon} size={22} color={item.color} />
                <Text style={styles.trustText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </AnimatedSection>

        {/* ===== SERVICES ===== */}
        <AnimatedSection delay={180}>
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: 24 }]}>Servicios disponibles</Text>
            <View style={styles.servicesList}>
              {companyServices.map((svc) => (
                <View key={svc.id} style={[styles.serviceCard, { backgroundColor: colors.white }]}>
                  <View style={styles.serviceTop}>
                    <View style={[styles.serviceIconWrap, { backgroundColor: colors.accentTint }]}>
                      <Icon source="washing-machine" size={22} color={colors.accent} />
                    </View>
                    <View style={styles.serviceInfo}>
                      <View style={styles.serviceNameRow}>
                        <Text style={styles.serviceName} numberOfLines={1}>{svc.name}</Text>
                        <View style={styles.serviceRating}>
                          <Icon source="star" size={12} color={colors.accent} />
                          <Text style={styles.serviceRatingText}>{company.rating}</Text>
                        </View>
                      </View>
                      <Text style={styles.serviceDesc} numberOfLines={2}>{svc.description}</Text>
                      <View style={styles.serviceMeta}>
                        <Text style={styles.servicePrice}>{formatCurrency(svc.price)}</Text>
                        <Text style={styles.serviceSep}>·</Text>
                        <Icon source="clock-outline" size={12} color={colors.gray400} />
                        <Text style={styles.serviceTime}>{formatMinutes(svc.timeEstimate || 60)}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.push({ pathname: '/(modals)/request-service', params: { companyId: company.id, serviceId: svc.id } })}
                    style={[styles.serviceBtn, { backgroundColor: colors.accent }]}
                  >
                    <Text style={styles.serviceBtnText}>Reservar</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {companyServices.length === 0 && (
                <Text style={styles.emptyServices}>No hay servicios disponibles</Text>
              )}
            </View>
          </View>
        </AnimatedSection>

        {/* ===== REVIEWS ===== */}
        <AnimatedSection delay={220}>
          <View style={styles.sectionBlock}>
            <View style={[styles.reviewHeader, { paddingHorizontal: 24 }]}>
              <Text style={styles.sectionTitle}>Opiniones</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.reviewAll}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            {mockReviews.map((review) => (
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
            ))}
          </View>
        </AnimatedSection>

        {/* ===== SCHEDULE / CONTACT ===== */}
        <AnimatedSection delay={260}>
          <View style={[styles.sectionCard, { backgroundColor: colors.white }]}>
            <Text style={styles.sectionTitle}>Horario y ubicación</Text>
            <View style={styles.schedRow}>
              <Icon source="clock-outline" size={16} color={colors.gray400} />
              <Text style={styles.schedText}>Lun - Vie: 8:00 - 20:00</Text>
            </View>
            <View style={styles.schedRow}>
              <Icon source="clock-outline" size={16} color={colors.gray400} />
              <Text style={styles.schedText}>Sáb: 9:00 - 18:00</Text>
            </View>
            <View style={styles.schedRow}>
              <Icon source="clock-outline" size={16} color={colors.gray400} />
              <Text style={styles.schedText}>Dom: Cerrado</Text>
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

      {/* ===== FIXED CTA ===== */}
      <View style={[styles.bottomBar, { backgroundColor: colors.white }]}>
        <View style={styles.bottomPrice}>
          <Text style={styles.bottomPriceValue}>{formatCurrency(company.minPrice || 2500)}</Text>
          <Text style={styles.bottomPriceLabel}>/ hora · {company.distance || 1.2} km</Text>
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

  /* ===== HERO ===== */
  heroWrap: { height: 240, position: 'relative' },
  heroCover: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  heroTopBar: { position: 'absolute', top: Platform.OS === 'ios' ? 56 : 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  heroBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  heroTopRight: { flexDirection: 'row', gap: 8 },
  heroLogo: { position: 'absolute', bottom: -32, left: 24, width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadows.md },
  heroLogoText: { fontFamily: 'Poppins_700Bold', fontSize: 30, color: colors.white },

  /* ===== COMPANY INFO ===== */
  infoCard: { marginTop: 32, marginHorizontal: 24, borderRadius: radii.lg, padding: 20, ...shadows.sm },
  infoTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  infoName: { fontFamily: 'Poppins_600SemiBold', fontSize: 22, color: colors.blue900, flex: 1, marginRight: 8, letterSpacing: -0.3 },
  verBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 10, borderRadius: radii.full },
  verText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: colors.accentDark },
  infoRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  infoRating: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.blue900 },
  infoReviews: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray400 },
  infoMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  infoMetaText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600 },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.gray300, marginHorizontal: 4 },
  infoPrice: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray600 },
  infoPriceValue: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: colors.accent, letterSpacing: -0.3 },
  infoPriceUnit: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray600 },

  /* ===== GALLERY ===== */
  galleryContainer: { paddingVertical: 16, gap: 8 },
  galleryImg: { width: 140, height: 100, borderRadius: radii.md },

  /* ===== SECTION ===== */
  sectionCard: { marginHorizontal: 24, borderRadius: radii.lg, padding: 20, marginBottom: 16, ...shadows.sm },
  sectionBlock: { marginBottom: 16 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: colors.blue900, marginBottom: 12 },
  sectionBody: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray600, lineHeight: 22, marginBottom: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full },
  tagLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },

  /* ===== TRUST ===== */
  trustGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  trustCard: { width: (SCREEN_WIDTH - 48 - 8) / 2, borderRadius: radii.md, padding: 14, gap: 8, ...shadows.sm },
  trustText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.gray600, lineHeight: 15 },

  /* ===== SERVICES ===== */
  servicesList: { paddingHorizontal: 24, gap: 12 },
  serviceCard: { borderRadius: radii.md, padding: 16, gap: 14, ...shadows.sm },
  serviceTop: { flexDirection: 'row', gap: 12 },
  serviceIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  serviceInfo: { flex: 1 },
  serviceNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  serviceName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.blue900, flex: 1, marginRight: 6 },
  serviceRating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  serviceRatingText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.gray600 },
  serviceDesc: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray600, lineHeight: 17, marginBottom: 6 },
  serviceMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  servicePrice: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.accent },
  serviceSep: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray300, marginHorizontal: 2 },
  serviceTime: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray600 },
  serviceBtn: { paddingVertical: 10, borderRadius: radii.full, alignItems: 'center' },
  serviceBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.white },
  emptyServices: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray400, textAlign: 'center', paddingVertical: 20 },

  /* ===== REVIEWS ===== */
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reviewAll: { fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.accentDark },
  reviewCard: { marginHorizontal: 24, marginTop: 10, borderRadius: radii.md, padding: 16, ...shadows.sm },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.white },
  reviewInfo: { flex: 1 },
  reviewName: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.blue900 },
  reviewStars: { flexDirection: 'row', gap: 1, marginTop: 2 },
  reviewDate: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray400 },
  reviewText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600, lineHeight: 19 },

  /* ===== SCHEDULE ===== */
  schedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  schedText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600 },
  mapPlaceholder: { borderRadius: radii.md, padding: 24, alignItems: 'center', gap: 6, marginBottom: 14, marginTop: 4 },
  mapText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.blue700 },
  mapSubtext: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.blue500 },
  contactRow: { flexDirection: 'row', gap: 12 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16, borderRadius: radii.full, borderWidth: 1, borderColor: colors.gray100, flex: 1, justifyContent: 'center' },
  contactBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.accent },

  /* ===== BOTTOM BAR ===== */
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 32 : 12, borderTopWidth: 1, borderTopColor: colors.gray100 },
  bottomPrice: { flex: 1 },
  bottomPriceValue: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: colors.accent, letterSpacing: -0.3 },
  bottomPriceLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray400, marginTop: 1 },
  bottomCta: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: radii.full },
  bottomCtaText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.white },
});
