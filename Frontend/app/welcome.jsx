import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Animated, Image } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, radii, shadows } from '../src/theme';
import AppButton from '../src/components/ui/AppButton';

const trustItems = [
  { icon: 'domain', value: '+320', label: 'Empresas verificadas' },
  { icon: 'check-circle-outline', value: '+18K', label: 'Servicios completados' },
  { icon: 'star', value: '4.8', label: 'Calificación promedio' },
];

const steps = [
  { number: '01', title: 'Busca un servicio', desc: 'Indica qué necesitas y tu ciudad para ver las opciones disponibles.' },
  { number: '02', title: 'Compara empresas', desc: 'Revisa calificación, precio y tiempo estimado de cada una.' },
  { number: '03', title: 'Reserva', desc: 'Confirma el servicio en minutos, sin llamadas ni filas.' },
  { number: '04', title: 'Disfruta', desc: 'Recibe tu ropa lista y califica tu experiencia.' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [showSteps, setShowSteps] = useState(false);

  const fadeAnims = useRef(Array.from({ length: 6 }, () => new Animated.Value(0))).current;
  const slideAnims = useRef(Array.from({ length: 6 }, () => new Animated.Value(24))).current;

  useEffect(() => {
    Animated.stagger(120, fadeAnims.map((anim, i) =>
      Animated.parallel([
        Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnims[i], { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    )).start();
  }, []);

  const handleExplore = useCallback(async () => {
    try {
      await AsyncStorage.setItem('hasLaunchedBefore', 'true');
    } catch {}
    router.replace('/(app)');
  }, [router]);

  const toggleSteps = useCallback(() => {
    setShowSteps((prev) => !prev);
  }, []);

  const renderAnimatedElement = (index, children) => (
    <Animated.View
      style={{
        opacity: fadeAnims[index],
        transform: [{ translateY: slideAnims[index] }],
      }}
    >
      {children}
    </Animated.View>
  );

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.white }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.inner}>
        {renderAnimatedElement(0,
          <View style={styles.logoWrap}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        )}

        {renderAnimatedElement(1,
          <View style={[styles.eyebrow, { backgroundColor: colors.accentTint }]}>
            <Text style={styles.eyebrowText}>Marketplace de lavado</Text>
          </View>
        )}

        {renderAnimatedElement(2,
          <Text style={styles.headline}>
            Tu ropa,{' '}
            <Text style={styles.headlineAccent}>sin complicaciones.</Text>
          </Text>
        )}

        {renderAnimatedElement(3,
          <Text style={styles.subtitle}>
            Conecta con lavanderías verificadas cerca de ti. Compara precios, reserva en minutos y recibe tu ropa lista cuando la necesites.
          </Text>
        )}

        {renderAnimatedElement(4,
          <View style={styles.trustRow}>
            {trustItems.map((item, i) => (
              <View key={i} style={[styles.trustCard, { backgroundColor: colors.white, borderColor: colors.gray100 }]}>
                <Icon source={item.icon} size={20} color={colors.accent} />
                <Text style={styles.trustValue}>{item.value}</Text>
                <Text style={styles.trustLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        )}

        {renderAnimatedElement(5,
          <View style={styles.buttons}>
            <AppButton
              title="Explorar servicios"
              onPress={handleExplore}
              variant="primary"
              fullWidth
            />
            <AppButton
              title="Conocer la plataforma"
              onPress={toggleSteps}
              variant="ghost"
              fullWidth
            />
          </View>
        )}

        {showSteps && (
          <View style={[styles.stepsCard, { backgroundColor: colors.gray50, borderColor: colors.gray100 }]}>
            <Text style={styles.stepsTitle}>Cómo funciona ServiLavadora</Text>
            {steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={[styles.stepNumber, { backgroundColor: colors.blue900 }]}>
                  <Text style={styles.stepNumberText}>{step.number}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  logoWrap: {
    marginBottom: 32,
  },
  logo: {
    width: 140,
    height: 56,
  },
  eyebrow: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.full,
    marginBottom: 20,
  },
  eyebrowText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.04,
    textTransform: 'uppercase',
    color: colors.accentDark,
  },
  headline: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 34,
    lineHeight: 41,
    color: colors.blue900,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  headlineAccent: {
    color: colors.accent,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: 36,
    maxWidth: 320,
  },
  trustRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 40,
  },
  trustCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 6,
    ...shadows.sm,
  },
  trustValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: colors.blue900,
  },
  trustLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 14,
  },
  buttons: {
    width: '100%',
    gap: 10,
  },
  stepsCard: {
    width: '100%',
    marginTop: 28,
    padding: 24,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: 20,
  },
  stepsTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: colors.blue900,
    textAlign: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: colors.blue900,
    marginBottom: 2,
  },
  stepDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.gray600,
    lineHeight: 18,
  },
});
