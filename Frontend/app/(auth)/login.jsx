import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput, Image, Animated, Keyboard } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { colors, radii } from '../../src/theme';
import AppButton from '../../src/components/ui/AppButton';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD = {
  idle: { border: colors.gray100, icon: colors.gray400 },
  focus: { border: colors.accent, icon: colors.accent },
  error: { border: colors.error, icon: colors.error },
  success: { border: colors.accent, icon: colors.accent },
};

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailState, setEmailState] = useState('idle');
  const [passwordState, setPasswordState] = useState('idle');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(20)).current;
  const formFade = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(30)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(heroSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(formFade, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(formSlide, { toValue: 0, duration: 450, useNativeDriver: true }),
      ]).start();
    }, 200);
  }, []);

  const handleLogin = useCallback(async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      await signIn(
        { id: 1, name: 'Juan Pérez', username: email || 'usuario', email: email.trim() || 'usuario@email.com', role: 'cliente' },
        'mock_token_123',
      );
      router.replace('/(app)');
    } finally {
      setLoading(false);
    }
  }, [email, signIn, router]);

  const c = (s) => FIELD[s]?.icon || colors.gray400;
  const b = (s) => FIELD[s]?.border || colors.gray100;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false}>
        {/* HERO */}
        <Animated.View style={[styles.hero, { opacity: heroFade, transform: [{ translateY: heroSlide }] }]}>
          <View style={styles.decorDiagonal} />
          <View style={styles.decorAngle} />
          <View style={styles.decorLight} />

          <View style={styles.heroContent}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.welcome}>Bienvenido a ServiLavadora</Text>
            <View style={styles.propsList}>
              <Text style={styles.propLine}>Encuentra lavanderías verificadas</Text>
              <Text style={styles.propLine}>Reserva en minutos</Text>
              <Text style={styles.propLine}>Compara precios y servicios</Text>
            </View>
            <View style={styles.trustRow}>
              <View style={styles.trustPill}>
                <Icon source="shield-check" size={13} color={colors.accent} />
                <Text style={styles.trustText}>320+ empresas</Text>
              </View>
              <View style={styles.trustPill}>
                <Icon source="star" size={13} color={colors.accent} />
                <Text style={styles.trustText}>4.8/5</Text>
              </View>
              <View style={styles.trustPill}>
                <Icon source="clock-outline" size={13} color={colors.accent} />
                <Text style={styles.trustText}>Reserva rápida</Text>
              </View>
            </View>
          </View>
          <View style={styles.heroCurve} />
        </Animated.View>

        {/* FORM */}
        <Animated.View style={[styles.formCard, { opacity: formFade, transform: [{ translateY: formSlide }] }]}>
          <TouchableOpacity style={styles.googleBtn} activeOpacity={0.7}>
            <Icon source="google" size={20} color="#4285F4" />
            <Text style={styles.googleText}>Continuar con Google</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o inicia con tu correo</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <View style={[styles.inputWrap, { borderColor: b(emailState) }, emailState === 'focus' && styles.inputFocused]}>
              <Icon source="email-outline" size={20} color={c(emailState)} />
              <TextInput
                style={styles.input}
                placeholder="tucorreo@ejemplo.com"
                placeholderTextColor={colors.gray400}
                value={email}
                onChangeText={(v) => { setEmail(v); if (emailState === 'error') { setEmailState('idle'); setEmailError(''); } }}
                onFocus={() => setEmailState('focus')}
                onBlur={() => { if (!emailError) setEmailState(email.trim() ? 'success' : 'idle'); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={[styles.inputWrap, { borderColor: b(passwordState) }, passwordState === 'focus' && styles.inputFocused]}>
              <Icon source="lock-outline" size={20} color={c(passwordState)} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.gray400}
                value={password}
                onChangeText={(v) => { setPassword(v); if (passwordState === 'error') { setPasswordState('idle'); setPasswordError(''); } }}
                onFocus={() => setPasswordState('focus')}
                onBlur={() => { if (!passwordError) setPasswordState(password ? 'success' : 'idle'); }}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn} activeOpacity={0.6}>
                <Icon source={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.gray400} />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {generalError ? (
            <View style={styles.generalError}>
              <Icon source="alert-circle-outline" size={16} color={colors.error} />
              <Text style={styles.generalErrorText}>{generalError}</Text>
            </View>
          ) : null}

          <View style={styles.row}>
            <TouchableOpacity style={styles.checkboxRow} onPress={() => setRemember(!remember)} activeOpacity={0.7}>
              <Icon source={remember ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={remember ? colors.accent : colors.gray400} />
              <Text style={[styles.checkboxLabel, remember && { color: colors.blue900 }]}>Recordarme</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} activeOpacity={0.7}>
              <Text style={styles.forgotLink}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleLogin}
              onPressIn={() => Animated.spring(btnScale, { toValue: 0.97, friction: 8, useNativeDriver: true }).start()}
              onPressOut={() => Animated.spring(btnScale, { toValue: 1, friction: 4, useNativeDriver: true }).start()}
              disabled={loading}
            >
              <AppButton title="Iniciar sesión" onPress={handleLogin} loading={loading} disabled={loading} fullWidth />
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.terms}>
            Al continuar, aceptas nuestros <Text style={styles.termsLink}>Términos</Text> y{' '}
            <Text style={styles.termsLink}>Política de privacidad</Text>.
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')} activeOpacity={0.7}>
              <Text style={styles.registerLink}>Regístrate gratis</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.blue900 },
  scroll: { flexGrow: 1 },

  /* =========================================================
     HERO
     ========================================================= */
  hero: {
    backgroundColor: colors.blue900,
    paddingTop: 52,
    paddingHorizontal: 24,
    paddingBottom: 36,
    alignItems: 'center',
    position: 'relative',
  },
  decorDiagonal: {
    position: 'absolute',
    width: 320,
    height: 420,
    backgroundColor: colors.accent,
    opacity: 0.1,
    top: -120,
    right: -90,
    transform: [{ rotate: '16deg' }],
  },
  decorAngle: {
    position: 'absolute',
    width: 220,
    height: 280,
    backgroundColor: colors.white,
    opacity: 0.04,
    bottom: -50,
    left: -70,
    transform: [{ rotate: '-7deg' }],
  },
  decorLight: {
    position: 'absolute',
    width: 160,
    height: 160,
    backgroundColor: colors.accent,
    opacity: 0.06,
    top: 10,
    right: 20,
    borderRadius: 36,
    transform: [{ rotate: '40deg' }],
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  logo: {
    width: 180,
    height: 73,
    marginBottom: 28,
  },
  welcome: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 26,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: -0.3,
  },
  propsList: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 6,
  },
  propLine: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    lineHeight: 20,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.full,
  },
  trustText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.white,
  },
  heroCurve: {
    position: 'absolute',
    bottom: -28,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    zIndex: 2,
  },

  /* =========================================================
     FORM CARD
     ========================================================= */
  formCard: {
    backgroundColor: colors.white,
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 20,
  },

  /* Google */
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.gray100,
    backgroundColor: colors.white,
  },
  googleText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.gray900,
  },

  /* Divider */
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray100,
  },
  dividerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.gray400,
  },

  /* Fields */
  fieldGroup: { gap: 6 },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.blue900,
    marginLeft: 2,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 54,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    borderWidth: 1,
    backgroundColor: colors.white,
  },
  inputFocused: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 2,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.gray900,
    padding: 0,
    margin: 0,
    outlineStyle: 'none',
    ...(Platform.OS === 'web' ? { outline: 'none' } : {}),
  },
  eyeBtn: { padding: 4, marginLeft: 4 },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.error,
    marginLeft: 2,
    marginTop: 2,
  },
  generalError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FCEBEB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.sm,
  },
  generalErrorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.error,
    flex: 1,
  },

  /* Row */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkboxLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.gray600,
  },
  forgotLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.accentDark,
  },

  /* Terms */
  terms: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.gray400,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: -4,
  },
  termsLink: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.accentDark,
  },

  /* Footer */
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.gray600,
  },
  registerLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.accentDark,
  },
});
