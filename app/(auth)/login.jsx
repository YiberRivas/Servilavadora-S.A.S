import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import AppInput from '../../src/components/ui/AppInput';
import AppButton from '../../src/components/ui/AppButton';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const handleLogin = async () => {
    if (!username || !password) {
      setSnackbar({ visible: true, message: 'Completa todos los campos' });
      return;
    }

    setLoading(true);
    try {
      // Mock login - Fase 1 solo frontend
      const mockUser = {
        id: 1,
        name: 'Juan Pérez',
        username: username,
        email: 'juan@email.com',
        role: 'cliente',
      };
      const mockToken = 'mock_token_123';

      await signIn(mockUser, mockToken);
      router.replace('/(app)');
    } catch (error) {
      setSnackbar({ visible: true, message: 'Error al iniciar sesión' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary + '20' }]}>
            <Text style={styles.logoIcon}>🧺</Text>
          </View>
          <Text variant="headlineMedium" style={[styles.title, { color: colors.onBackground }]}>
            Iniciar Sesión
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
            Accede a tu cuenta
          </Text>
        </View>

        <View style={styles.form}>
          <AppInput
            label="Usuario"
            value={username}
            onChangeText={setUsername}
            icon="account"
            autoCapitalize="none"
          />
          <AppInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            icon="lock"
            right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword(!showPassword)} />}
          />

          <AppButton
            title="Iniciar Sesión"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
          />

          <View style={styles.links}>
            <Text
              variant="bodyMedium"
              style={{ color: colors.primary, fontWeight: '600' }}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              ¿Olvidaste tu contraseña?
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
            ¿No tienes una cuenta?{' '}
            <Text
              variant="bodyMedium"
              style={{ color: colors.primary, fontWeight: '600' }}
              onPress={() => router.push('/(auth)/register')}
            >
              Regístrate aquí
            </Text>
          </Text>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        action={{ label: 'OK', onPress: () => {} }}
      >
        {snackbar.message}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

import { TextInput } from 'react-native-paper';

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 36,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
  },
  form: {
    marginBottom: 32,
  },
  links: {
    alignItems: 'center',
    marginTop: 16,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
});
