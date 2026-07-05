import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Card, useTheme, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { benefits } from '../../src/constants/mockData';
import AppButton from '../../src/components/ui/AppButton';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <Text style={styles.heroTitle}>Servilavadora</Text>
        <Text style={styles.heroSubtitle}>Alquiler de lavadoras fácil y rápido</Text>
        <Text style={styles.heroDescription}>
          Alquila lavadoras de alta calidad por horas. Solo $3.000 por hora.
        </Text>
        <View style={styles.heroStats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>50+</Text>
            <Text style={styles.statLabel}>Lavadoras</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>1K+</Text>
            <Text style={styles.statLabel}>Clientes</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Calificación</Text>
          </View>
        </View>
        <AppButton
          title="Ver Lavadoras"
          onPress={() => router.push('/(app)/companies')}
          mode="contained"
          style={styles.heroButton}
          labelStyle={{ color: colors.primary }}
          color={colors.white}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: colors.onBackground }]}>
          Beneficios
        </Text>
        <View style={styles.benefitsGrid}>
          {benefits.map((benefit, index) => (
            <Card key={index} style={[styles.benefitCard, { backgroundColor: colors.surface }]}>
              <Card.Content style={styles.benefitContent}>
                <View style={[styles.benefitIcon, { backgroundColor: colors.primary + '20' }]}>
                  <IconButton icon={benefit.icon} size={28} iconColor={colors.primary} style={styles.benefitIconButton} />
                </View>
                <Text variant="titleSmall" style={styles.benefitTitle}>{benefit.title}</Text>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
                  {benefit.description}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </View>

      {!user && (
        <View style={[styles.ctaSection, { backgroundColor: colors.primary }]}>
          <Text style={styles.ctaTitle}>¿Listo para comenzar?</Text>
          <Text style={styles.ctaSubtitle}>Regístrate y encuentra la lavadora perfecta para ti</Text>
          <View style={styles.ctaButtons}>
            <AppButton title="Iniciar Sesión" onPress={() => router.push('/(auth)/login')} mode="contained" style={styles.ctaButton} labelStyle={{ color: colors.primary }} color={colors.white} />
            <AppButton title="Registrarse" onPress={() => router.push('/(auth)/register')} mode="outlined" style={styles.ctaButton} labelStyle={{ color: colors.white }} color={colors.white} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroTitle: { fontSize: 32, fontWeight: '800', color: '#ffffff', marginBottom: 8 },
  heroSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginBottom: 16 },
  heroDescription: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  heroStats: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 24 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', color: '#ffffff' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  heroButton: { borderRadius: 24, paddingHorizontal: 32, backgroundColor: '#ffffff' },
  section: { padding: 24 },
  sectionTitle: { fontWeight: '700', marginBottom: 16 },
  benefitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  benefitCard: { flex: 1, minWidth: '45%', borderRadius: 16, elevation: 2 },
  benefitContent: { alignItems: 'center', paddingVertical: 16 },
  benefitIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  benefitIconButton: { margin: 0 },
  benefitTitle: { fontWeight: '600', marginBottom: 4 },
  ctaSection: { margin: 24, padding: 32, borderRadius: 24, alignItems: 'center' },
  ctaTitle: { fontSize: 22, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  ctaSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: 20 },
  ctaButtons: { gap: 12, width: '100%' },
  ctaButton: { borderRadius: 24 },
});
