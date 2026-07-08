import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { benefits, companies } from '../../src/constants/mockData';
import { colors, radii, shadows } from '../../src/theme';
import AppButton from '../../src/components/ui/AppButton';

const categories = [
  { icon: 'washing-machine', label: 'Lavado\npor carga' },
  { icon: 'lightning-bolt', label: 'Lavado\nexpress' },
  { icon: 'home', label: 'Lavadora\na domicilio' },
  { icon: 'truck', label: 'Recogida\ny entrega' },
  { icon: 'iron', label: 'Planchado' },
  { icon: 'briefcase', label: 'Lavado\nempresarial' },
];

const companyGradients = [colors.blue500, colors.accent, colors.blue700];
const companyLabels = ['LN', 'EL', 'LR'];

export default function HomeScreen() {
  const router = useRouter();

  const categoryColors = [colors.blue100, colors.accentTint, colors.blue100, colors.accentTint, colors.blue100, colors.accentTint];
  const categoryIconColors = [colors.blue700, colors.accentDark, colors.blue700, colors.accentDark, colors.blue700, colors.accentDark];

  const handleCompanyPress = (company) => {
    router.push({ pathname: '/(modals)/company-detail', params: { id: company.id } });
  };

  const renderCategory = (cat, index) => (
    <TouchableOpacity
      key={index}
      style={[styles.categoryChip, { backgroundColor: colors.white, borderColor: colors.gray100 }]}
      activeOpacity={0.7}
      onPress={() => router.push('/(app)/services')}
    >
      <View style={[styles.categoryIconBox, { backgroundColor: categoryColors[index] }]}>
        <Icon source={cat.icon} size={18} color={categoryIconColors[index]} />
      </View>
      <Text style={styles.categoryLabel}>{cat.label}</Text>
    </TouchableOpacity>
  );

  const renderBenefit = ({ item }) => (
    <View style={[styles.benefitCard, { backgroundColor: colors.white, borderColor: colors.gray100 }]}>
      <View style={[styles.benefitIconBox, { backgroundColor: colors.accentTint }]}>
        <Icon source={item.icon} size={22} color={colors.accentDark} />
      </View>
      <Text style={styles.benefitTitle}>{item.title}</Text>
      <Text style={styles.benefitDesc}>{item.description}</Text>
    </View>
  );

  const renderCompany = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.companyCard, { backgroundColor: colors.white, borderColor: colors.gray100 }]}
      activeOpacity={0.7}
      onPress={() => handleCompanyPress(item)}
    >
      <View style={[styles.companyLogo, { backgroundColor: companyGradients[index] }]}>
        <Text style={styles.companyLogoText}>{companyLabels[index]}</Text>
      </View>
      <Text style={styles.companyName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.companyCity} numberOfLines={1}>{item.location.split('-')[0].trim()}</Text>
      <View style={styles.companyRatingRow}>
        <Icon source="star" size={13} color={colors.accent} />
        <Text style={styles.companyRating}>{item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.gray50 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ===== HEADER ===== */}
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
              <Text style={styles.locationText}>Bogotá</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notifButton} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={20} color={colors.gray600} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ===== HERO ===== */}
        <View style={[styles.hero, { backgroundColor: colors.blue100 }]}>
          <View style={styles.heroBlob} />
          <View style={styles.heroContent}>
            <Text style={styles.heroEyebrow}>Marketplace de lavanderías</Text>
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
              <Text style={styles.searchPlaceholder}>¿Qué necesitas lavar?</Text>
            </TouchableOpacity>

            <View style={styles.categoryGrid}>
              {categories.slice(0, 3).map((cat, i) => renderCategory(cat, i))}
            </View>
            <View style={styles.categoryGrid}>
              {categories.slice(3).map((cat, i) => renderCategory(cat, i + 3))}
            </View>
          </View>
        </View>

        {/* ===== TRUST BAR ===== */}
        <View style={[styles.trustBar, { backgroundColor: colors.white }]}>
          <View style={styles.trustItem}>
            <Text style={styles.trustValue}>+320</Text>
            <Text style={styles.trustLabel}>empresas</Text>
          </View>
          <View style={[styles.trustDivider, { backgroundColor: colors.gray100 }]} />
          <View style={styles.trustItem}>
            <Text style={styles.trustValue}>+18K</Text>
            <Text style={styles.trustLabel}>servicios</Text>
          </View>
          <View style={[styles.trustDivider, { backgroundColor: colors.gray100 }]} />
          <View style={styles.trustItem}>
            <Text style={styles.trustValue}>4.8</Text>
            <Text style={styles.trustLabel}>calificación</Text>
          </View>
        </View>

        {/* ===== COMPANIES ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Empresas destacadas</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(app)/companies')}>
              <Text style={styles.sectionAction}>Ver todo</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={companies}
            renderItem={renderCompany}
            keyExtractor={(item) => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.companyList}
            snapToInterval={168}
            decelerationRate="fast"
          />
        </View>

        {/* ===== CTA ===== */}
        <View style={[styles.cta, { backgroundColor: colors.white }]}>
          <Text style={styles.ctaTitle}>¿Listo para comenzar?</Text>
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
  screen: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 24,
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLogo: {
    width: 200,
    height: 150,
    
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    color: colors.blue900,
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  locationText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.gray600,
  },
  notifButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* HERO */
  hero: {
    position: 'relative',
    overflow: 'hidden',
    paddingBottom: 32,
  },
  heroBlob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.blue500,
    opacity: 0.06,
    top: -100,
    right: -80,
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  heroEyebrow: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.04,
    textTransform: 'uppercase',
    color: colors.accentDark,
    marginBottom: 10,
  },
  heroTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 28,
    lineHeight: 34,
    color: colors.blue900,
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: colors.gray600,
    marginBottom: 24,
    maxWidth: 300,
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    height: 52,
    borderRadius: radii.full,
    marginBottom: 24,
    ...shadows.lg,
  },
  searchPlaceholder: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.gray400,
  },
  categoryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  categoryChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  categoryIconBox: {
    width: 30,
    height: 30,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    color: colors.blue900,
    flex: 1,
  },

  /* TRUST BAR */
  trustBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  trustItem: {
    flex: 1,
    alignItems: 'center',
  },
  trustValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: colors.blue900,
  },
  trustLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.gray600,
    marginTop: 1,
  },
  trustDivider: {
    width: 1,
    height: 32,
  },

  /* SECTIONS */
  section: {
    paddingTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: colors.blue900,
    letterSpacing: -0.3,
  },
  sectionAction: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.accent,
  },

  /* COMPANIES */
  companyList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  companyCard: {
    width: 156,
    padding: 18,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
    ...shadows.sm,
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  companyLogoText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: colors.white,
  },
  companyName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: colors.blue900,
    textAlign: 'center',
  },
  companyCity: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.gray400,
    textAlign: 'center',
  },
  companyRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  companyRating: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.blue900,
  },

  /* CTA */
  cta: {
    marginHorizontal: 20,
    marginTop: 32,
    padding: 28,
    borderRadius: radii.lg,
    alignItems: 'center',
    gap: 12,
    ...shadows.sm,
  },
  ctaTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: colors.blue900,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  ctaSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: 4,
  },
});
