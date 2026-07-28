import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput, Image, Animated, Keyboard } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { authService } from '../../src/services/auth.service';
import { colors, radii } from '../../src/theme';
import AppButton from '../../src/components/ui/AppButton';

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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailState, setEmailState] = useState('idle');
  const [passwordState, setPasswordState] = useState('idle');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [remember, setRemember] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(heroSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = useCallback(async () => {
    Keyboard.dismiss();
    setGeneralError('');
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('El usuario es requerido');
      setEmailState('error');
      return;
    }
    if (!password) {
      setPasswordError('La contrasena es requerida');
      setPasswordState('error');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.login(email.trim(), password);
      await signIn(result.user, result.access_token, result.refresh_token);
      if (result.user.rol === 'REPARTIDOR') {
        router.replace('/(driver)');
      } else {
        router.replace('/(app)');
      }
    } catch (error) {
      const msg = error.message || 'Error al iniciar sesion';
      if (msg.toLowerCase().includes('credenciales') || msg.toLowerCase().includes('invalidas')) {
        setGeneralError('Usuario o contrasena incorrectos');
      } else if (msg.toLowerCase().includes('bloqueado')) {
        setGeneralError('Usuario bloqueado por intentos fallidos');
      } else if (msg.toLowerCase().includes('desactivado')) {
        setGeneralError('Usuario desactivado');
      } else {
        setGeneralError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [email, password, signIn, router]);

  const c = (s) => FIELD[s]?.icon || colors.gray400;
  const b = (s) => FIELD[s]?.border || colors.gray100;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* HERO */}
        <Animated.View style={[styles.hero, { opacity: heroFade, transform: [{ translateY: heroSlide }] }]}>
          <View style={styles.decorDiagonal} />
          <View style={styles.decorAngle} />
          <View style={styles.decorLight} />

          <View style={styles.heroContent}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.welcome}>Bienvenido a ServiLavadora</Text>
            <View style={styles.propsList}>
              <Text style={styles.propLine}>Encuentra lavanderias verificadas</Text>
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
                <Text style={styles.trustText}>Reserva rapida</Text>
              </View>
            </View>
          </View>
          <View style={styles.heroCurve} />
        </Animated.View>

        {/* FORM */}
        <View style={styles.formCard}>
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
            <Text style={styles.label}>Usuario</Text>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => emailRef.current?.focus()}
              style={[styles.inputWrap, { borderColor: b(emailState) }, emailState === 'focus' && styles.inputFocused]}
            >
              <Icon source="account-outline" size={20} color={c(emailState)} />
              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder="Ingresa tu usuario"
                placeholderTextColor={colors.gray400}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (emailState === 'error') {
                    setEmailState('idle');
                    setEmailError('');
                  }
                }}
                onFocus={() => setEmailState('focus')}
                onBlur={() => {
                  if (!emailError) setEmailState(email.trim() ? 'success' : 'idle');
                }}
                autoCapitalize="none"
                autoComplete="username"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </TouchableOpacity>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contrasena</Text>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => passwordRef.current?.focus()}
              style={[styles.inputWrap, { borderColor: b(passwordState) }, passwordState === 'focus' && styles.inputFocused]}
            >
              <Icon source="lock-outline" size={20} color={c(passwordState)} />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="********"
                placeholderTextColor={colors.gray400}
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (passwordState === 'error') {
                    setPasswordState('idle');
                    setPasswordError('');
                  }
                }}
                onFocus={() => setPasswordState('focus')}
                onBlur={() => {
                  if (!passwordError) setPasswordState(password ? 'success' : 'idle');
                }}
                secureTextEntry={!showPassword}
                autoComplete="password"
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn} activeOpacity={0.6}>
                <Icon source={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.gray400} />
              </TouchableOpacity>
            </TouchableOpacity>
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
              <Text style={styles.forgotLink}>Olvidaste tu contrasena?</Text>
            </TouchableOpacity>
          </View>

          <AppButton title="Iniciar sesion" onPress={handleLogin} loading={loading} disabled={loading} fullWidth />

          <Text style={styles.terms}>
            Al continuar, aceptas nuestros <Text style={styles.termsLink}>Terminos</Text> y{' '}
            <Text style={styles.termsLink}>Politica de privacidad</Text>.
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')} activeOpacity={0.7}>
              <Text style={styles.registerLink}>Registrate gratis</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.blue900 },
  scroll: { flexGrow: 1 },

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

  formCard: {
    backgroundColor: colors.white,
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 20,
  },

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
    height: 44,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.gray900,
    borderWidth: 0,
    backgroundColor: 'transparent',
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
