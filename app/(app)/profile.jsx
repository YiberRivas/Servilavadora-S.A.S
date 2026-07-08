import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { colors, radii, shadows } from '../../src/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 12;
const GRID_PADDING = 24;
const GRID_CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

const quickActions = [
  { key: 'reservas', icon: 'calendar-clock', title: 'Mis reservas', desc: 'Historial y próximas' },
  { key: 'favoritas', icon: 'heart-outline', title: 'Favoritas', desc: 'Empresas guardadas' },
  { key: 'pagos', icon: 'credit-card-outline', title: 'Métodos de pago', desc: 'Tarjetas y más' },
  { key: 'direcciones', icon: 'map-marker-outline', title: 'Direcciones', desc: 'Recogida y entrega' },
  { key: 'notificaciones', icon: 'bell-outline', title: 'Notificaciones', desc: 'Alertas y avisos' },
  { key: 'frecuentes', icon: 'star-outline', title: 'Servicios frecuentes', desc: 'Tus favoritos' },
];

const howItWorks = [
  { icon: 'magnify', title: 'Busca un servicio', desc: 'Encuentra la lavandería perfecta para lo que necesitas' },
  { icon: 'store-outline', title: 'Compara empresas', desc: 'Revisa precios, calificaciones y reseñas' },
  { icon: 'calendar-check', title: 'Reserva', desc: 'Elige el horario y confirma tu servicio' },
  { icon: 'sparkles', title: 'Disfruta', desc: 'Recibe tu ropa limpia, fresca y lista para usar' },
];

const supportItems = [
  { key: 'help', icon: 'lifebuoy', title: 'Centro de ayuda', desc: 'Guías y tutoriales' },
  { key: 'faq', icon: 'help-circle-outline', title: 'Preguntas frecuentes', desc: 'Respuestas rápidas' },
  { key: 'contact', icon: 'email-outline', title: 'Contacto', desc: 'Escríbenos' },
  { key: 'report', icon: 'alert-circle-outline', title: 'Reportar un problema', desc: 'Soporte técnico' },
];

const settingsItems = [
  { key: 'edit', icon: 'account-cog-outline', title: 'Editar perfil' },
  { key: 'language', icon: 'translate', title: 'Idioma', value: 'Español' },
  { key: 'privacy', icon: 'shield-account', title: 'Privacidad' },
  { key: 'security', icon: 'lock-outline', title: 'Seguridad' },
  { key: 'appearance', icon: 'palette-outline', title: 'Apariencia' },
];

function SectionHeader({ title }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function AnimatedSection({ children, delay = 0 }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const isLoggedIn = !!user;

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const userName = user?.name || 'Invitado';
  const firstLetter = userName.charAt(0).toUpperCase();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ===== HERO ===== */}
      <AnimatedSection delay={0}>
        <View style={[styles.heroCard, { backgroundColor: colors.white }]}>
          <View style={styles.heroTopRow}>
            <View style={[styles.heroAvatar, { backgroundColor: colors.blue900 }]}>
              <Text style={styles.heroAvatarText}>{firstLetter}</Text>
            </View>
            <View style={styles.heroBadge}>
              <Icon source="check-decagram" size={14} color={colors.accent} />
              <Text style={styles.heroBadgeText}>Verificada</Text>
            </View>
          </View>
          <Text style={styles.heroName}>{userName}</Text>
          <Text style={styles.heroCity}>Bogotá, Colombia</Text>
          <Text style={styles.heroMessage}>
            {isLoggedIn
              ? 'Gracias por confiar en ServiLavadora'
              : 'Inicia sesión para gestionar tu cuenta'}
          </Text>
        </View>
      </AnimatedSection>

      {/* ===== STATS ===== */}
      <AnimatedSection delay={100}>
        <View style={[styles.statsCard, { backgroundColor: colors.white }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Servicios</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Favoritas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4</Text>
              <Text style={styles.statLabel}>Este mes</Text>
            </View>
          </View>
          <View style={styles.statsFooter}>
            <Icon source="calendar-outline" size={14} color={colors.gray400} />
            <Text style={styles.statsFooterText}>Miembro desde julio 2025</Text>
          </View>
        </View>
      </AnimatedSection>

      {/* ===== QUICK ACTIONS ===== */}
      <SectionHeader title="Acceso rápido" />
      <AnimatedSection delay={200}>
        <View style={styles.quickGrid}>
          {quickActions.map((item) => (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.7}
              style={[styles.quickCard, { backgroundColor: colors.white }]}
            >
              <View style={[styles.quickIconWrap, { backgroundColor: colors.accentTint }]}>
                <Icon source={item.icon} size={20} color={colors.accent} />
              </View>
              <View style={styles.quickTextWrap}>
                <Text style={styles.quickTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.quickDesc} numberOfLines={1}>{item.desc}</Text>
              </View>
              <Icon source="chevron-right" size={16} color={colors.gray300} />
            </TouchableOpacity>
          ))}
        </View>
      </AnimatedSection>

      {/* ===== HOW IT WORKS ===== */}
      <SectionHeader title="¿Cómo funciona?" />
      <AnimatedSection delay={300}>
        <View style={[styles.howCard, { backgroundColor: colors.white }]}>
          {howItWorks.map((step, i) => (
            <View key={step.title} style={styles.howStep}>
              <View style={styles.howIndicator}>
                <View style={[styles.howCircle, { backgroundColor: colors.accentTint }]}>
                  <Icon source={step.icon} size={18} color={colors.accent} />
                </View>
                {i < howItWorks.length - 1 && <View style={[styles.howLine, { backgroundColor: colors.gray100 }]} />}
              </View>
              <View style={styles.howContent}>
                <Text style={styles.howTitle}>{step.title}</Text>
                <Text style={styles.howDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </AnimatedSection>

      {/* ===== SUPPORT ===== */}
      <SectionHeader title="Soporte" />
      <AnimatedSection delay={400}>
        <View style={[styles.listCard, { backgroundColor: colors.white }]}>
          {supportItems.map((item, i) => (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.7}
              style={[styles.listRow, i < supportItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.gray50 }]}
            >
              <View style={[styles.listIconWrap, { backgroundColor: colors.accentTint }]}>
                <Icon source={item.icon} size={18} color={colors.accent} />
              </View>
              <View style={styles.listTextWrap}>
                <Text style={styles.listTitle}>{item.title}</Text>
                <Text style={styles.listDesc}>{item.desc}</Text>
              </View>
              <Icon source="chevron-right" size={20} color={colors.gray300} />
            </TouchableOpacity>
          ))}
        </View>
      </AnimatedSection>

      {/* ===== SETTINGS ===== */}
      <SectionHeader title="Configuración" />
      <AnimatedSection delay={500}>
        <View style={[styles.listCard, { backgroundColor: colors.white }]}>
          {settingsItems.map((item, i) => (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.7}
              style={[styles.listRow, i < settingsItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.gray50 }]}
            >
              <View style={[styles.listIconWrap, { backgroundColor: colors.gray50 }]}>
                <Icon source={item.icon} size={18} color={colors.blue700} />
              </View>
              <Text style={styles.listTitle}>{item.title}</Text>
              {item.value && <Text style={styles.listValue}>{item.value}</Text>}
              <Icon source="chevron-right" size={20} color={colors.gray300} />
            </TouchableOpacity>
          ))}
        </View>
      </AnimatedSection>

      {/* ===== LOGOUT / LOGIN ===== */}
      <AnimatedSection delay={550}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={isLoggedIn ? handleLogout : handleLogin}
          style={[styles.logoutBtn, { backgroundColor: colors.white }]}
        >
          <Icon
            source={isLoggedIn ? 'logout' : 'login'}
            size={20}
            color={isLoggedIn ? colors.error : colors.accent}
          />
          <Text style={[styles.logoutText, { color: isLoggedIn ? colors.error : colors.accent }]}>
            {isLoggedIn ? 'Cerrar sesión' : 'Iniciar sesión'}
          </Text>
        </TouchableOpacity>
      </AnimatedSection>

      {/* ===== APP INFO ===== */}
      <AnimatedSection delay={600}>
        <View style={[styles.appInfoCard, { backgroundColor: colors.white }]}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.appInfoLogo}
            resizeMode="contain"
          />
          <Text style={styles.appInfoName}>ServiLavadora</Text>
          <Text style={styles.appInfoVersion}>Versión 1.0.0</Text>
          <Text style={styles.appInfoCopyright}>
            © 2026 ServiLavadora. Todos los derechos reservados.
          </Text>
          <View style={styles.appInfoLinks}>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.appInfoLink}>Política de privacidad</Text>
            </TouchableOpacity>
            <Text style={styles.appInfoDot}>·</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.appInfoLink}>Términos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },

  /* ===== SECTION HEADER ===== */
  sectionHeader: {
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: colors.blue900,
  },

  /* ===== HERO ===== */
  heroCard: {
    marginHorizontal: 24,
    borderRadius: radii.lg,
    padding: 24,
    ...shadows.sm,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  heroAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatarText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: colors.white,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.accentTint,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.full,
  },
  heroBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: colors.accentDark,
  },
  heroName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 22,
    color: colors.blue900,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  heroCity: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.gray600,
    marginBottom: 16,
  },
  heroMessage: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.gray400,
    lineHeight: 18,
  },

  /* ===== STATS ===== */
  statsCard: {
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: radii.lg,
    padding: 20,
    ...shadows.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: colors.accent,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.gray600,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.gray100,
  },
  statsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.gray50,
  },
  statsFooterText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.gray400,
  },

  /* ===== QUICK ACTIONS ===== */
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    paddingHorizontal: GRID_PADDING,
  },
  quickCard: {
    width: GRID_CARD_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radii.md,
    padding: 14,
    ...shadows.sm,
  },
  quickIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTextWrap: {
    flex: 1,
  },
  quickTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.blue900,
  },
  quickDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: colors.gray400,
    marginTop: 1,
  },

  /* ===== HOW IT WORKS ===== */
  howCard: {
    marginHorizontal: 24,
    borderRadius: radii.lg,
    padding: 20,
    ...shadows.sm,
  },
  howStep: {
    flexDirection: 'row',
    gap: 14,
  },
  howIndicator: {
    alignItems: 'center',
    width: 38,
  },
  howCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  howLine: {
    width: 1,
    flex: 1,
    marginVertical: 2,
  },
  howContent: {
    flex: 1,
    paddingBottom: 20,
    paddingTop: 4,
  },
  howTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.blue900,
    marginBottom: 3,
  },
  howDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.gray600,
    lineHeight: 18,
  },

  /* ===== LIST CARD (support / settings) ===== */
  listCard: {
    marginHorizontal: 24,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  listIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listTextWrap: {
    flex: 1,
  },
  listTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.gray900,
    flex: 1,
  },
  listDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.gray400,
    marginTop: 1,
  },
  listValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.gray600,
    marginRight: 4,
  },

  /* ===== LOGOUT ===== */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 24,
    marginTop: 24,
    paddingVertical: 15,
    borderRadius: radii.full,
    ...shadows.sm,
  },
  logoutText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },

  /* ===== APP INFO ===== */
  appInfoCard: {
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: radii.lg,
    padding: 28,
    alignItems: 'center',
    gap: 6,
    ...shadows.sm,
  },
  appInfoLogo: {
    width: 100,
    height: 40,
    marginBottom: 8,
  },
  appInfoName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: colors.blue900,
  },
  appInfoVersion: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.gray400,
  },
  appInfoCopyright: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.gray400,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
  appInfoLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  appInfoLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.accentDark,
  },
  appInfoDot: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.gray300,
  },
});
