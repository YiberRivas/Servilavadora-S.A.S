import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, RefreshControl } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { homeCategories } from '../../src/constants/data/home';
import { companiesService } from '../../src/services';
import { colors, radii, shadows } from '../../src/theme';
import AppButton from '../../src/components/ui/AppButton';
import SkeletonCard from '../../src/components/ui/SkeletonCard';

const LOGO_COLORS = ['#12A594', '#1F4E79', '#8b5cf6', '#f59e0b', '#ef4444', '#0ea5e9', '#10b981'];

function getLogoBg(uuid) {
  if (!uuid) return LOGO_COLORS[0];
  const idx = uuid.charCodeAt(0) % LOGO_COLORS.length;
  return LOGO_COLORS[idx];
}

function mapBackendToCard(e) {
  return {
    id: e.uuid,
    name: e.nombre_comercial || 'Sin nombre',
    neighborhood: e.neighborhood || '',
    city: e.city || '',
    verified: e.verified || false,
    tarifa_min: e.tarifa_min || 0,
    tarifa_max: e.tarifa_max || 0,
    total_lavadoras: e.total_lavadoras || 0,
    lavadoras_disponibles: e.lavadoras_disponibles || 0,
    capacities: e.capacities || [],
  };
}

export default function HomeScreen() {
  const router = useRouter();
  const [companiesData, setCompaniesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadCompanies = useCallback(async () => {
    try {
      setError(null);
      const response = await companiesService.list();
      if (response.success && response.data) {
        setCompaniesData(response.data.map(mapBackendToCard));
      } else {
        setCompaniesData([]);
      }
    } catch (err) {
      setError('No se pudieron cargar las empresas.');
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

  const totalEmpresas = companiesData.length;
  const totalLavadoras = useMemo(
    () => companiesData.reduce((sum, c) => sum + c.total_lavadoras, 0),
    [companiesData]
  );
  const totalCiudades = useMemo(
    () => new Set(companiesData.map((c) => c.city).filter(Boolean)).size || 1,
    [companiesData]
  );

  const handleCompanyPress = useCallback(
    (company) => {
      router.push({ pathname: '/(modals)/company-detail', params: { id: company.id } });
    },
    [router]
  );

  const handleNotifPress = useCallback(() => {
    router.push('/(app)/notifications');
  }, [router]);

  const renderCompany = useCallback(({ item }) => (
    <TouchableOpacity
      style={[styles.companyCard, { backgroundColor: colors.white, borderColor: colors.gray100 }]}
      activeOpacity={0.7}
      onPress={() => handleCompanyPress(item)}
    >
      <View style={[styles.companyLogo, { backgroundColor: getLogoBg(item.id) }]}>
        <Text style={styles.companyLogoText}>{item.name.charAt(0)}</Text>
      </View>
      <Text style={styles.companyName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.companyCity} numberOfLines={1}>
        {item.neighborhood || item.city || 'Sin ubicacion'}
      </Text>
      {item.verified && (
        <View style={styles.verifiedRow}>
          <Icon source="check-decagram" size={12} color={colors.accent} />
          <Text style={styles.verifiedText}>Verificada</Text>
        </View>
      )}
      <Text style={styles.companyPrice}>
        {item.tarifa_min > 0 ? `Desde $${item.tarifa_min.toLocaleString()}` : 'Consultar precio'}
      </Text>
    </TouchableOpacity>
  ), [handleCompanyPress]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.gray50 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} tintColor={colors.accent} />
        }
      >
        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: colors.white }]}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../../assets/images/logov2.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={[styles.locationPill, { backgroundColor: colors.gray50 }]} activeOpacity={0.7}>
              <Icon source="map-marker" size={14} color={colors.accent} />
              <Text style={styles.locationText}>Quibdo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notifButton} activeOpacity={0.7} onPress={handleNotifPress}>
              <Ionicons name="notifications-outline" size={20} color={colors.gray600} />
            </TouchableOpacity>
          </View>
        </View>

        {/* HERO */}
        <View style={[styles.hero, { backgroundColor: colors.blue100 }]}>
          <View style={styles.heroBlob} />
          <View style={styles.heroContent}>
            <Text style={styles.heroEyebrow}>Marketplace de lavanderias</Text>
            <Text style={styles.heroTitle}>
              Descubre el lavado{'\n'}perfecto para ti
            </Text>
            <Text style={styles.heroSubtitle}>
              Compara precios, revisa calificaciones y reserva en minutos desde tu celular.
            </Text>

            <TouchableOpacity
              style={[styles.searchPill, { backgroundColor: colors.white }]}
              activeOpacity={0.8}
              onPress={() => router.push('/(app)/services')}
            >
              <Icon source="magnify" size={20} color={colors.gray400} />
              <Text style={styles.searchPlaceholder}>Que necesitas lavar?</Text>
            </TouchableOpacity>

            <View style={styles.categoryGrid}>
              {homeCategories.slice(0, 3).map((cat, i) => (
                <TouchableOpacity
                  key={cat.label}
                  style={[styles.categoryChip, { backgroundColor: colors.white, borderColor: colors.gray100 }]}
                  activeOpacity={0.7}
                  onPress={() => router.push('/(app)/services')}
                >
                  <View style={[styles.categoryIconBox, { backgroundColor: i % 2 === 0 ? colors.blue100 : colors.accentTint }]}>
                    <Icon source={cat.icon} size={18} color={i % 2 === 0 ? colors.blue700 : colors.accentDark} />
                  </View>
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.categoryGrid}>
              {homeCategories.slice(3).map((cat, i) => (
                <TouchableOpacity
                  key={cat.label}
                  style={[styles.categoryChip, { backgroundColor: colors.white, borderColor: colors.gray100 }]}
                  activeOpacity={0.7}
                  onPress={() => router.push('/(app)/services')}
                >
                  <View style={[styles.categoryIconBox, { backgroundColor: (i + 3) % 2 === 0 ? colors.blue100 : colors.accentTint }]}>
                    <Icon source={cat.icon} size={18} color={(i + 3) % 2 === 0 ? colors.blue700 : colors.accentDark} />
                  </View>
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* TRUST BAR */}
        <View style={[styles.trustBar, { backgroundColor: colors.white }]}>
          <View style={styles.trustItem}>
            <Text style={styles.trustValue}>+{totalEmpresas}</Text>
            <Text style={styles.trustLabel}>empresas</Text>
          </View>
          <View style={[styles.trustDivider, { backgroundColor: colors.gray100 }]} />
          <View style={styles.trustItem}>
            <Text style={styles.trustValue}>+{totalLavadoras}</Text>
            <Text style={styles.trustLabel}>lavadoras</Text>
          </View>
          <View style={[styles.trustDivider, { backgroundColor: colors.gray100 }]} />
          <View style={styles.trustItem}>
            <Text style={styles.trustValue}>{totalCiudades}</Text>
            <Text style={styles.trustLabel}>ciudades</Text>
          </View>
        </View>

        {/* COMPANIES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Empresas destacadas</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(app)/companies')}>
              <Text style={styles.sectionAction}>Ver todo</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.skelList}>
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : error ? (
            <View style={styles.errorState}>
              <Icon source="cloud-off-outline" size={40} color={colors.gray300} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={loadCompanies}
                style={[styles.retryBtn, { backgroundColor: colors.accent }]}
              >
                <Icon source="refresh" size={16} color={colors.white} />
                <Text style={styles.retryBtnText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : companiesData.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon source="store-outline" size={40} color={colors.gray300} />
              <Text style={styles.emptyText}>No hay empresas disponibles</Text>
            </View>
          ) : (
            <FlatList
              data={companiesData}
              renderItem={renderCompany}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.companyList}
              snapToInterval={168}
              decelerationRate="fast"
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              windowSize={5}
            />
          )}
        </View>

        {/* CTA */}
        <View style={[styles.cta, { backgroundColor: colors.white }]}>
          <Text style={styles.ctaTitle}>Listo para comenzar?</Text>
          <Text style={styles.ctaSubtitle}>
            Explora todos los servicios disponibles y encuentra lo que necesitas.
          </Text>
          <AppButton
            title="Ver servicios"
            onPress={() => router.push('/(app)/services')}
            variant="primary"
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingBottom: 24 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 0,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerLogo: { width: 200, height: 150 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.full,
  },
  locationText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.gray600 },
  notifButton: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },

  hero: { position: 'relative', overflow: 'hidden', paddingBottom: 32 },
  heroBlob: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: colors.blue500, opacity: 0.06, top: -100, right: -80,
  },
  heroContent: { paddingHorizontal: 20, paddingTop: 28 },
  heroEyebrow: {
    fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 0.04,
    textTransform: 'uppercase', color: colors.accentDark, marginBottom: 10,
  },
  heroTitle: {
    fontFamily: 'Poppins_600SemiBold', fontSize: 28, lineHeight: 34,
    color: colors.blue900, letterSpacing: -0.4, marginBottom: 12,
  },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22,
    color: colors.gray600, marginBottom: 24, maxWidth: 300,
  },
  searchPill: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, height: 52, borderRadius: radii.full,
    marginBottom: 24, ...shadows.lg,
  },
  searchPlaceholder: { fontFamily: 'Inter_400Regular', fontSize: 15, color: colors.gray400 },
  categoryGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  categoryChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: radii.md, borderWidth: 1,
  },
  categoryIconBox: {
    width: 30, height: 30, borderRadius: radii.sm,
    justifyContent: 'center', alignItems: 'center',
  },
  categoryLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 11, lineHeight: 14,
    color: colors.blue900, flex: 1,
  },

  trustBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, paddingHorizontal: 20,
  },
  trustItem: { flex: 1, alignItems: 'center' },
  trustValue: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.blue900 },
  trustLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray600, marginTop: 1 },
  trustDivider: { width: 1, height: 32 },

  section: { paddingTop: 28 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 16,
  },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: colors.blue900, letterSpacing: -0.3 },
  sectionAction: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.accent },

  companyList: { paddingHorizontal: 20, gap: 12 },
  companyCard: {
    width: 156, padding: 18, borderRadius: radii.lg, borderWidth: 1,
    alignItems: 'center', gap: 8, ...shadows.sm,
  },
  companyLogo: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  companyLogoText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.white },
  companyName: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: colors.blue900, textAlign: 'center' },
  companyCity: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray400, textAlign: 'center' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  verifiedText: { fontFamily: 'Inter_500Medium', fontSize: 10, color: colors.accent },
  companyPrice: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: colors.blue900 },

  skelList: { paddingHorizontal: 20, gap: 14 },
  errorState: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray600, textAlign: 'center' },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: radii.full,
  },
  retryBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.white },
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray600 },

  cta: {
    marginHorizontal: 20, marginTop: 32, padding: 28, borderRadius: radii.lg,
    alignItems: 'center', gap: 12, ...shadows.sm,
  },
  ctaTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: colors.blue900, textAlign: 'center', letterSpacing: -0.3 },
  ctaSubtitle: {
    fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20,
    color: colors.gray600, textAlign: 'center', marginBottom: 4,
  },
});
