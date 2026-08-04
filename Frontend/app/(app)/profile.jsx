import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Alert, Switch, RefreshControl, ActivityIndicator, Image, Modal, TextInput } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { profileService } from '../../src/services/profile.service';
import { authService } from '../../src/services/auth.service';
import { formatCurrency } from '../../src/utils/formatters';
import { colors, radii, shadows } from '../../src/theme';
import { FAQ_ITEMS } from '../../src/constants';
import AppButton from '../../src/components/ui/AppButton';

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

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [preferredPayment, setPreferredPayment] = useState('cash');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({ nombres: '', apellidos: '', telefono: '' });
  const [editLoading, setEditLoading] = useState(false);

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const loadProfile = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (err) {
      setError(err.message || 'Error al cargar perfil');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const userName = profile?.nombre_completo || user?.nombre_completo || '';
  const firstLetter = userName.charAt(0).toUpperCase();

  const handleLogout = useCallback(async () => {
    Alert.alert('Cerrar sesion', 'Estas seguro que deseas cerrar sesion?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesion',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }, [signOut, router]);

  const handleChangePassword = useCallback(() => {
    setPasswordForm({ current: '', newPass: '', confirm: '' });
    setPasswordModalVisible(true);
  }, []);

  const handleSubmitPassword = useCallback(async () => {
    if (!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      Alert.alert('Error', 'Las contrasenas no coinciden');
      return;
    }
    if (passwordForm.newPass.length < 6) {
      Alert.alert('Error', 'La contrasena debe tener al menos 6 caracteres');
      return;
    }
    setPasswordLoading(true);
    try {
      await authService.changePassword(passwordForm.current, passwordForm.newPass);
      setPasswordModalVisible(false);
      Alert.alert('Exito', 'Contrasena actualizada correctamente');
    } catch (err) {
      Alert.alert('Error', err.message || 'Error al cambiar contrasena');
    } finally {
      setPasswordLoading(false);
    }
  }, [passwordForm]);

  const handleEditProfile = useCallback(() => {
    setEditForm({
      nombres: profile?.nombres || '',
      apellidos: profile?.apellidos || '',
      telefono: profile?.telefono || '',
    });
    setEditModalVisible(true);
  }, [profile]);

  const handleSubmitEdit = useCallback(async () => {
    if (!editForm.nombres || !editForm.apellidos) {
      Alert.alert('Error', 'Nombres y apellidos son requeridos');
      return;
    }
    setEditLoading(true);
    try {
      await profileService.updateProfile(user.uuid, {
        nombres: editForm.nombres,
        apellidos: editForm.apellidos,
        telefono: editForm.telefono,
      });
      setEditModalVisible(false);
      loadProfile();
      Alert.alert('Exito', 'Perfil actualizado correctamente');
    } catch (err) {
      Alert.alert('Error', err.message || 'Error al actualizar perfil');
    } finally {
      setEditLoading(false);
    }
  }, [editForm, user?.uuid, loadProfile]);

  const handleToggleFaq = useCallback((id) => {
    setExpandedFaq((prev) => (prev === id ? null : id));
  }, []);

  if (loading) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Icon source="alert-circle-outline" size={48} color={colors.error} />
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 16, color: colors.gray600, marginTop: 12, textAlign: 'center' }}>{error}</Text>
        <AppButton title="Reintentar" onPress={() => loadProfile()} style={{ marginTop: 16 }} icon="refresh" />
      </View>
    );
  }

  const addr = profile?.direccion;
  const formattedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <>
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadProfile(true)} colors={[colors.accent]} tintColor={colors.accent} />}
    >
      {/* SECTION 1: PERSONAL INFO */}
      <AnimatedSection delay={0}>
        <View style={[styles.heroCard, { backgroundColor: colors.white }]}>
          <View style={styles.heroTopRow}>
            {profile?.foto ? (
              <Image source={{ uri: profile.foto }} style={[styles.heroAvatar, { backgroundColor: colors.blue900 }]} />
            ) : (
              <View style={[styles.heroAvatar, { backgroundColor: colors.blue900 }]}>
                <Text style={styles.heroAvatarText}>{firstLetter}</Text>
              </View>
            )}
            <View style={styles.heroBadge}>
              <Icon source="check-decagram" size={14} color={colors.accent} />
              <Text style={styles.heroBadgeText}>{profile?.estado ? 'Activa' : 'Inactiva'}</Text>
            </View>
          </View>

          <Text style={styles.heroName}>{userName}</Text>
          <Text style={styles.heroEmail}>{profile?.correo || ''}</Text>

          <View style={styles.heroDetails}>
            <View style={styles.heroDetailItem}>
              <Icon source="phone-outline" size={14} color={colors.gray400} />
              <Text style={styles.heroDetailText}>{profile?.telefono || 'No registrado'}</Text>
            </View>
            <View style={styles.heroDetailItem}>
              <Icon source="map-marker-outline" size={14} color={colors.gray400} />
              <Text style={styles.heroDetailText}>
                {addr ? `${addr.barrio || ''}, ${addr.municipio || ''}` : 'No registrada'}
              </Text>
            </View>
            {formattedDate ? (
              <View style={styles.heroDetailItem}>
                <Icon source="calendar-outline" size={14} color={colors.gray400} />
                <Text style={styles.heroDetailText}>Registro: {formattedDate}</Text>
              </View>
            ) : null}
            <View style={styles.heroDetailItem}>
              <Icon source="shield-outline" size={14} color={colors.gray400} />
              <Text style={styles.heroDetailText}>{profile?.rol_nombre || ''}</Text>
            </View>
          </View>

          <AppButton
            title="Editar informacion"
            onPress={handleEditProfile}
            variant="outline"
            fullWidth
            icon="pencil"
          />
        </View>
      </AnimatedSection>

      {/* SECTION 2: ADDRESSES */}
      <SectionHeader title="Mis direcciones" />
      <AnimatedSection delay={100}>
        <View style={[styles.listCard, { backgroundColor: colors.white }]}>
          {addr ? (
            <View style={styles.addrItem}>
              <View style={styles.addrHeader}>
                <View style={[styles.addrIconWrap, { backgroundColor: colors.accentTint }]}>
                  <Icon source="home-outline" size={18} color={colors.accent} />
                </View>
                <View style={styles.addrInfo}>
                  <View style={styles.addrLabelRow}>
                    <Text style={styles.addrLabel}>Direccion principal</Text>
                    <View style={[styles.addrPrimaryBadge, { backgroundColor: colors.accentTint }]}>
                      <Text style={[styles.addrPrimaryText, { color: colors.accent }]}>Principal</Text>
                    </View>
                  </View>
                  <Text style={styles.addrText}>{addr.direccion}</Text>
                  <Text style={styles.addrDetails}>{addr.barrio}, {addr.municipio}</Text>
                  {addr.complemento && <Text style={styles.addrExtra}>{addr.complemento}</Text>}
                </View>
              </View>
            </View>
          ) : (
            <View style={[styles.addrItem, { alignItems: 'center', paddingVertical: 24 }]}>
              <Icon source="map-marker-off-outline" size={32} color={colors.gray300} />
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray400, marginTop: 8 }}>No registrada</Text>
            </View>
          )}
        </View>
      </AnimatedSection>

      {/* SECTION 3: PAYMENT METHODS */}
      <SectionHeader title="Metodos de pago" />
      <AnimatedSection delay={200}>
        <View style={[styles.listCard, { backgroundColor: colors.white }]}>
          {[
            { id: 'cash', label: 'Efectivo', icon: 'cash' },
            { id: 'nequi', label: 'Nequi', icon: 'cellphone' },
            { id: 'daviplata', label: 'Daviplata', icon: 'cellphone' },
            { id: 'transfer', label: 'Transferencia bancaria', icon: 'bank-transfer' },
          ].map((pm, i, arr) => {
            const isPreferred = preferredPayment === pm.id;
            return (
              <TouchableOpacity
                key={pm.id}
                activeOpacity={0.7}
                onPress={() => setPreferredPayment(pm.id)}
                style={[styles.pmItem, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.gray50 }]}
              >
                <View style={[styles.pmIconWrap, { backgroundColor: isPreferred ? colors.accentTint : colors.gray50 }]}>
                  <Icon source={pm.icon} size={20} color={isPreferred ? colors.accent : colors.gray400} />
                </View>
                <Text style={[styles.pmLabel, isPreferred && { color: colors.accent }]}>{pm.label}</Text>
                {isPreferred && (
                  <View style={[styles.pmPreferredBadge, { backgroundColor: colors.accentTint }]}>
                    <Text style={[styles.pmPreferredText, { color: colors.accent }]}>Preferido</Text>
                  </View>
                )}
                <View style={[styles.pmRadio, isPreferred && { borderColor: colors.accent }]}>
                  {isPreferred && <View style={[styles.pmRadioFill, { backgroundColor: colors.accent }]} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </AnimatedSection>

      {/* SECTION 4: STATISTICS */}
      <SectionHeader title="Estadisticas" />
      <AnimatedSection delay={300}>
        <View style={[styles.statsCard, { backgroundColor: colors.white }]}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Servicios realizados</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.accent }]}>0</Text>
              <Text style={styles.statLabel}>Servicios activos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Empresas utilizadas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0h</Text>
              <Text style={styles.statLabel}>Horas de alquiler</Text>
            </View>
          </View>
          <View style={[styles.statsTotal, { backgroundColor: colors.gray50 }]}>
            <Icon source="cash" size={18} color={colors.accent} />
            <Text style={styles.statsTotalLabel}>Total invertido</Text>
            <Text style={[styles.statsTotalValue, { color: colors.accent }]}>{formatCurrency(0)}</Text>
          </View>
        </View>
      </AnimatedSection>

      {/* SECTION 5: CONFIGURATION */}
      <SectionHeader title="Configuracion" />
      <AnimatedSection delay={400}>
        <View style={[styles.listCard, { backgroundColor: colors.white }]}>
          <View style={styles.configItem}>
            <View style={[styles.configIconWrap, { backgroundColor: colors.gray50 }]}>
              <Icon source="bell-outline" size={18} color={colors.blue700} />
            </View>
            <Text style={styles.configLabel}>Notificaciones</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.gray300, true: colors.accent + '50' }}
              thumbColor={notificationsEnabled ? colors.accent : colors.gray400}
            />
          </View>

          <View style={styles.configItem}>
            <View style={[styles.configIconWrap, { backgroundColor: colors.gray50 }]}>
              <Icon source="translate" size={18} color={colors.blue700} />
            </View>
            <Text style={styles.configLabel}>Idioma</Text>
            <Text style={styles.configValue}>Espanol</Text>
            <Icon source="chevron-right" size={20} color={colors.gray300} />
          </View>

          <View style={styles.configItem}>
            <View style={[styles.configIconWrap, { backgroundColor: colors.gray50 }]}>
              <Icon source="palette-outline" size={18} color={colors.blue700} />
            </View>
            <Text style={styles.configLabel}>Tema</Text>
            <Text style={styles.configValue}>Claro</Text>
            <Icon source="chevron-right" size={20} color={colors.gray300} />
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert('Privacidad', 'Configuracion de privacidad.')}
            style={styles.configItem}
          >
            <View style={[styles.configIconWrap, { backgroundColor: colors.gray50 }]}>
              <Icon source="shield-account" size={18} color={colors.blue700} />
            </View>
            <Text style={[styles.configLabel, { flex: 1 }]}>Privacidad</Text>
            <Icon source="chevron-right" size={20} color={colors.gray300} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert('Terminos', 'Terminos y condiciones de Servilavadora S.A.S.')}
            style={styles.configItem}
          >
            <View style={[styles.configIconWrap, { backgroundColor: colors.gray50 }]}>
              <Icon source="file-document-outline" size={18} color={colors.blue700} />
            </View>
            <Text style={[styles.configLabel, { flex: 1 }]}>Terminos y condiciones</Text>
            <Icon source="chevron-right" size={20} color={colors.gray300} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert('Politica', 'Politica de tratamiento de datos personales.')}
            style={styles.configItem}
          >
            <View style={[styles.configIconWrap, { backgroundColor: colors.gray50 }]}>
              <Icon source="file-lock-outline" size={18} color={colors.blue700} />
            </View>
            <Text style={[styles.configLabel, { flex: 1 }]}>Politica de tratamiento de datos</Text>
            <Icon source="chevron-right" size={20} color={colors.gray300} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert('Acerca de', 'Servilavadora S.A.S. - Alquiler de lavadoras a domicilio.\nVersion 1.0.0\n2026 Todos los derechos reservados.')}
            style={styles.configItem}
          >
            <View style={[styles.configIconWrap, { backgroundColor: colors.gray50 }]}>
              <Icon source="information-outline" size={18} color={colors.blue700} />
            </View>
            <Text style={[styles.configLabel, { flex: 1 }]}>Acerca de Servilavadora S.A.S.</Text>
            <Icon source="chevron-right" size={20} color={colors.gray300} />
          </TouchableOpacity>
        </View>
      </AnimatedSection>

      {/* SECTION 6: SUPPORT */}
      <SectionHeader title="Soporte" />
      <AnimatedSection delay={500}>
        <View style={[styles.listCard, { backgroundColor: colors.white }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert('Centro de ayuda', 'Accede a guias y tutoriales.')}
            style={styles.supportItem}
          >
            <View style={[styles.supportIconWrap, { backgroundColor: colors.accentTint }]}>
              <Icon source="lifebuoy" size={18} color={colors.accent} />
            </View>
            <View style={styles.supportInfo}>
              <Text style={styles.supportLabel}>Centro de ayuda</Text>
              <Text style={styles.supportDesc}>Guias y tutoriales</Text>
            </View>
            <Icon source="chevron-right" size={20} color={colors.gray300} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert('Preguntas frecuentes', 'Revisa nuestras preguntas mas frecuentes.')}
            style={[styles.supportItem, { borderBottomWidth: 1, borderBottomColor: colors.gray50 }]}
          >
            <View style={[styles.supportIconWrap, { backgroundColor: colors.accentTint }]}>
              <Icon source="help-circle-outline" size={18} color={colors.accent} />
            </View>
            <View style={styles.supportInfo}>
              <Text style={styles.supportLabel}>Preguntas frecuentes</Text>
              <Text style={styles.supportDesc}>Respuestas rapidas</Text>
            </View>
            <Icon source="chevron-right" size={20} color={colors.gray300} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert('Contactar soporte', 'Escribe a soporte@servilavadora.co o llama al 300 000 0000.')}
            style={[styles.supportItem, { borderBottomWidth: 1, borderBottomColor: colors.gray50 }]}
          >
            <View style={[styles.supportIconWrap, { backgroundColor: colors.accentTint }]}>
              <Icon source="email-outline" size={18} color={colors.accent} />
            </View>
            <View style={styles.supportInfo}>
              <Text style={styles.supportLabel}>Contactar soporte</Text>
              <Text style={styles.supportDesc}>Escríbenos</Text>
            </View>
            <Icon source="chevron-right" size={20} color={colors.gray300} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert('Reportar problema', 'Describe el problema con la aplicacion y lo atenderemos pronto.')}
            style={styles.supportItem}
          >
            <View style={[styles.supportIconWrap, { backgroundColor: colors.error + '15' }]}>
              <Icon source="alert-circle-outline" size={18} color={colors.error} />
            </View>
            <View style={styles.supportInfo}>
              <Text style={styles.supportLabel}>Reportar un problema</Text>
              <Text style={styles.supportDesc}>Soporte tecnico</Text>
            </View>
            <Icon source="chevron-right" size={20} color={colors.gray300} />
          </TouchableOpacity>
        </View>
      </AnimatedSection>

      {/* SECTION 7: SECURITY */}
      <SectionHeader title="Seguridad" />
      <AnimatedSection delay={600}>
        <View style={[styles.listCard, { backgroundColor: colors.white }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleChangePassword}
            style={styles.securityItem}
          >
            <View style={[styles.securityIconWrap, { backgroundColor: colors.gray50 }]}>
              <Icon source="lock-outline" size={18} color={colors.blue700} />
            </View>
            <Text style={[styles.securityLabel, { flex: 1 }]}>Cambiar contrasena</Text>
            <Icon source="chevron-right" size={20} color={colors.gray300} />
          </TouchableOpacity>

          <View style={[styles.securityItem, { borderBottomWidth: 1, borderBottomColor: colors.gray50 }]}>
            <View style={[styles.securityIconWrap, { backgroundColor: colors.gray50 }]}>
              <Icon source="devices" size={18} color={colors.blue700} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.securityLabel}>Cerrar sesion en todos los dispositivos</Text>
              <Text style={styles.securityHint}>Proximamente</Text>
            </View>
          </View>

          <View style={styles.securityItem}>
            <View style={[styles.securityIconWrap, { backgroundColor: colors.gray50 }]}>
              <Icon source="shield-lock-outline" size={18} color={colors.blue700} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.securityLabel}>Autenticacion en dos pasos</Text>
              <Text style={styles.securityHint}>Proximamente</Text>
            </View>
          </View>
        </View>
      </AnimatedSection>

      {/* FAQ SECTION */}
      <SectionHeader title="Preguntas frecuentes" />
      <AnimatedSection delay={650}>
        <View style={[styles.listCard, { backgroundColor: colors.white }]}>
          {FAQ_ITEMS.map((faq, i) => {
            const isExpanded = expandedFaq === faq.id;
            return (
              <TouchableOpacity
                key={faq.id}
                activeOpacity={0.7}
                onPress={() => handleToggleFaq(faq.id)}
                style={[styles.faqItem, i < FAQ_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.gray50 }]}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Icon source={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.gray400} />
                </View>
                {isExpanded && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </AnimatedSection>

      {/* LOGOUT */}
      <AnimatedSection delay={700}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogout}
          style={[styles.logoutBtn, { backgroundColor: colors.white }]}
        >
          <Icon source="logout" size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Cerrar sesion</Text>
        </TouchableOpacity>
      </AnimatedSection>

      {/* APP INFO */}
      <AnimatedSection delay={750}>
        <View style={[styles.appInfoCard, { backgroundColor: colors.white }]}>
          <Text style={styles.appInfoName}>Servilavadora S.A.S.</Text>
          <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
          <Text style={styles.appInfoCopyright}>
            2026 Servilavadora S.A.S. Todos los derechos reservados.
          </Text>
        </View>
      </AnimatedSection>

      <View style={{ height: 40 }} />
    </ScrollView>

    <Modal visible={editModalVisible} transparent animationType="slide">
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View style={{ backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 }}>
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.blue900, marginBottom: 20 }}>Editar perfil</Text>
          <TextInput
            placeholder="Nombres"
            value={editForm.nombres}
            onChangeText={(v) => setEditForm({ ...editForm, nombres: v })}
            style={{ borderWidth: 1, borderColor: colors.gray200, borderRadius: 10, padding: 12, marginBottom: 12, fontFamily: 'Inter_400Regular', fontSize: 15 }}
          />
          <TextInput
            placeholder="Apellidos"
            value={editForm.apellidos}
            onChangeText={(v) => setEditForm({ ...editForm, apellidos: v })}
            style={{ borderWidth: 1, borderColor: colors.gray200, borderRadius: 10, padding: 12, marginBottom: 12, fontFamily: 'Inter_400Regular', fontSize: 15 }}
          />
          <TextInput
            placeholder="Telefono"
            value={editForm.telefono}
            onChangeText={(v) => setEditForm({ ...editForm, telefono: v })}
            keyboardType="phone-pad"
            style={{ borderWidth: 1, borderColor: colors.gray200, borderRadius: 10, padding: 12, marginBottom: 20, fontFamily: 'Inter_400Regular', fontSize: 15 }}
          />
          <AppButton title={editLoading ? 'Guardando...' : 'Guardar cambios'} onPress={handleSubmitEdit} loading={editLoading} disabled={editLoading} fullWidth />
          <AppButton title="Cancelar" onPress={() => setEditModalVisible(false)} variant="ghost" fullWidth style={{ marginTop: 8 }} />
        </View>
      </View>
    </Modal>

    <Modal visible={passwordModalVisible} transparent animationType="slide">
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View style={{ backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 }}>
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.blue900, marginBottom: 20 }}>Cambiar contrasena</Text>
          <TextInput
            placeholder="Contrasena actual"
            value={passwordForm.current}
            onChangeText={(v) => setPasswordForm({ ...passwordForm, current: v })}
            secureTextEntry
            style={{ borderWidth: 1, borderColor: colors.gray200, borderRadius: 10, padding: 12, marginBottom: 12, fontFamily: 'Inter_400Regular', fontSize: 15 }}
          />
          <TextInput
            placeholder="Nueva contrasena"
            value={passwordForm.newPass}
            onChangeText={(v) => setPasswordForm({ ...passwordForm, newPass: v })}
            secureTextEntry
            style={{ borderWidth: 1, borderColor: colors.gray200, borderRadius: 10, padding: 12, marginBottom: 12, fontFamily: 'Inter_400Regular', fontSize: 15 }}
          />
          <TextInput
            placeholder="Confirmar contrasena"
            value={passwordForm.confirm}
            onChangeText={(v) => setPasswordForm({ ...passwordForm, confirm: v })}
            secureTextEntry
            style={{ borderWidth: 1, borderColor: colors.gray200, borderRadius: 10, padding: 12, marginBottom: 20, fontFamily: 'Inter_400Regular', fontSize: 15 }}
          />
          <AppButton title={passwordLoading ? 'Cambiando...' : 'Cambiar contrasena'} onPress={handleSubmitPassword} loading={passwordLoading} disabled={passwordLoading} fullWidth />
          <AppButton title="Cancelar" onPress={() => setPasswordModalVisible(false)} variant="ghost" fullWidth style={{ marginTop: 8 }} />
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  scrollContent: { paddingTop: 12, paddingBottom: 24 },

  sectionHeader: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 8 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: colors.blue900 },

  /* HERO */
  heroCard: { marginHorizontal: 16, borderRadius: radii.lg, padding: 14, ...shadows.sm },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  heroAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  heroAvatarText: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: colors.white },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.accentTint, paddingVertical: 3, paddingHorizontal: 8, borderRadius: radii.full },
  heroBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: colors.accentDark },
  heroName: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.blue900, letterSpacing: -0.2 },
  heroEmail: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray600, marginBottom: 10 },
  heroDetails: { gap: 6, marginBottom: 12 },
  heroDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroDetailText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray600 },

  /* ADDRESSES */
  listCard: { marginHorizontal: 16, borderRadius: radii.lg, overflow: 'hidden', ...shadows.sm },
  addrItem: { padding: 10 },
  addrHeader: { flexDirection: 'row', gap: 8 },
  addrIconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  addrInfo: { flex: 1 },
  addrLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  addrLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.blue900 },
  addrPrimaryBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: radii.full },
  addrPrimaryText: { fontFamily: 'Inter_600SemiBold', fontSize: 9 },
  addrText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray600 },
  addrDetails: { fontFamily: 'Inter_400Regular', fontSize: 10, color: colors.gray400, marginTop: 1 },
  addrExtra: { fontFamily: 'Inter_400Regular', fontSize: 10, color: colors.gray400, marginTop: 1 },

  /* PAYMENT METHODS */
  pmItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 12 },
  pmIconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  pmLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.blue900, flex: 1 },
  pmPreferredBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: radii.full },
  pmPreferredText: { fontFamily: 'Inter_600SemiBold', fontSize: 9 },
  pmRadio: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.gray300, alignItems: 'center', justifyContent: 'center' },
  pmRadioFill: { width: 8, height: 8, borderRadius: 4 },

  /* STATISTICS */
  statsCard: { marginHorizontal: 16, borderRadius: radii.lg, padding: 14, ...shadows.sm },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statItem: { width: '47%', alignItems: 'center', paddingVertical: 8, backgroundColor: colors.gray50, borderRadius: radii.sm },
  statNumber: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: colors.blue900 },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: colors.gray600, marginTop: 2, textAlign: 'center' },
  statsTotal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, paddingVertical: 8, borderRadius: radii.sm },
  statsTotalLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.gray600 },
  statsTotalValue: { fontFamily: 'Poppins_700Bold', fontSize: 14 },

  /* CONFIGURATION */
  configItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: colors.gray50 },
  configIconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  configLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.gray900, flex: 1 },
  configValue: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray600, marginRight: 4 },

  /* SUPPORT */
  supportItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 12 },
  supportIconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  supportInfo: { flex: 1 },
  supportLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.gray900 },
  supportDesc: { fontFamily: 'Inter_400Regular', fontSize: 10, color: colors.gray400, marginTop: 1 },

  /* SECURITY */
  securityItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 12 },
  securityIconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  securityLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.gray900 },
  securityHint: { fontFamily: 'Inter_400Regular', fontSize: 10, color: colors.gray400, marginTop: 1 },

  /* FAQ */
  faqItem: { paddingVertical: 10, paddingHorizontal: 12 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  faqQuestion: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.blue900, flex: 1, marginRight: 6 },
  faqAnswer: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray600, marginTop: 6, lineHeight: 16 },

  /* LOGOUT */
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginHorizontal: 16, marginTop: 16, paddingVertical: 10, borderRadius: radii.full, ...shadows.sm },
  logoutText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },

  /* APP INFO */
  appInfoCard: { marginHorizontal: 16, marginTop: 16, borderRadius: radii.lg, padding: 14, alignItems: 'center', gap: 3, ...shadows.sm },
  appInfoName: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: colors.blue900 },
  appInfoVersion: { fontFamily: 'Inter_400Regular', fontSize: 10, color: colors.gray400 },
  appInfoCopyright: { fontFamily: 'Inter_400Regular', fontSize: 9, color: colors.gray400, textAlign: 'center', lineHeight: 14, marginTop: 2 },
});
