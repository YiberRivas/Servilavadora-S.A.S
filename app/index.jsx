import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, useTheme } from 'react-native-paper';
import { useAuth } from '../src/context/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isAuthenticated, loading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      if (!loading) {
        if (isAuthenticated) {
          router.replace('/(app)');
        } else {
          router.replace('/(auth)/onboarding');
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [loading, isAuthenticated]);

  if (loading) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🧺</Text>
        </View>
        <Text style={styles.title}>Servilavadora</Text>
        <Text style={styles.subtitle}>Alquiler de lavadoras fácil y rápido</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
  },
});
