import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../src/theme';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunchedBefore');
        router.replace(hasLaunched ? '/(app)' : '/welcome');
      } catch {
        router.replace('/welcome');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>
          Servi<Text style={styles.titleStrong}>Lavadora</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 65,
    marginBottom: 28,
  },
  title: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 34,
    color: colors.blue900,
    letterSpacing: -0.5,
  },
  titleStrong: {
    fontFamily: 'Poppins_700Bold',
  },
});
