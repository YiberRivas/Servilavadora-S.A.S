import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Platform, Keyboard } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { companies, services } from '../../src/constants/mockData';
import { formatCurrency, formatMinutes } from '../../src/utils/formatters';
import { colors, radii, shadows } from '../../src/theme';
import AppButton from '../../src/components/ui/AppButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STEPS = [
  { key: 'service', label: 'Servicio' },
  { key: 'date', label: 'Fecha' },
  { key: 'time', label: 'Horario' },
  { key: 'address', label: 'Dirección' },
  { key: 'confirm', label: 'Confirmar' },
];

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
];

const savedAddresses = [
  { id: 1, label: 'Casa', address: 'Calle 123 #45-67', icon: 'home-outline' },
  { id: 2, label: 'Trabajo', address: 'Av. El Dorado #50-20', icon: 'briefcase-outline' },
];

function generateDates() {
  const dates = [];
  const today = new Date();
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.push({
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate(),
      month: monthNames[d.getMonth()],
      full: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      isToday: i === 0,
    });
  }
  return dates;
}

function AnimatedStep({ children, visible }) {
  const anim = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const slide = useRef(new Animated.Value(visible ? 0 : 30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, { toValue: visible ? 1 : 0, duration: 300, useNativeDriver: true }),
      Animated.timing(slide, { toValue: visible ? 0 : 30, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY: slide }] }}>
      {children}
    </Animated.View>
  );
}

const LOGO_BG = [colors.accent, colors.blue700, colors.blue500, colors.accentDark, colors.blue900, colors.accent, colors.blue700, colors.gray600];

export default function RequestServiceScreen() {
  const router = useRouter();
  const { companyId, serviceId: preselectedServiceId } = useLocalSearchParams();
  const company = companies.find((c) => c.id === Number(companyId));
  const companyServices = useMemo(() => services.filter((s) => s.companyId === Number(companyId)), [companyId]);
  const dates = useMemo(() => generateDates(), []);

  const [step, setStep] = useState(preselectedServiceId ? 1 : 0);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [customAddress, setCustomAddress] = useState('');
  const [showCustomAddress, setShowCustomAddress] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const progress = ((step + 1) / STEPS.length) * 100;

  useEffect(() => {
    if (preselectedServiceId) {
      const svc = companyServices.find((s) => s.id === Number(preselectedServiceId));
      if (svc) {
        setSelectedService(svc);
        setSelectedDate(dates[0]);
      }
    }
  }, [preselectedServiceId]);

  const finalAddress = selectedAddress?.address || customAddress;

  const handleNext = useCallback(() => {
    if (step === STEPS.length - 1) {
      setConfirmed(true);
      return;
    }
    if (step === 0 && !selectedService) return;
    if (step === 1 && !selectedDate) return;
    if (step === 2 && !selectedTime) return;
    if (step === 3 && !finalAddress.trim()) return;
    Keyboard.dismiss();
    setStep((s) => s + 1);
  }, [step, selectedService, selectedDate, selectedTime, finalAddress]);

  const handleBack = useCallback(() => {
    if (confirmed) {
      router.back();
      return;
    }
    setStep((s) => Math.max(0, s - 1));
  }, [confirmed]);

  if (!company) {
    return (
      <View style={styles.center}>
        <Icon source="alert-circle-outline" size={48} color={colors.gray300} />
        <Text style={styles.centerText}>Empresa no encontrada</Text>
      </View>
    );
  }

  if (confirmed) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: colors.white }]}>
        <ConfirmedView service={selectedService} company={company} date={selectedDate} time={selectedTime} address={finalAddress} router={router} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleBack} style={styles.headerBack}>
            <Icon source="arrow-left" size={22} color={colors.blue900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 0 ? 'Seleccionar servicio' :
             step === 1 ? 'Elegir fecha' :
             step === 2 ? 'Elegir horario' :
             step === 3 ? 'Dirección' :
             'Confirmar reserva'}
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
            <Icon source="close" size={22} color={colors.blue900} />
          </TouchableOpacity>
        </View>

        {/* Stepper */}
        <View style={styles.stepper}>
          <View style={styles.stepperTrack}>
            <View style={[styles.stepperFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Step labels */}
        <View style={styles.stepLabels}>
          {STEPS.map((s, i) => (
            <View key={s.key} style={styles.stepLabelItem}>
              <View style={[styles.stepDot, i <= step && { backgroundColor: colors.accent }, i === step && styles.stepDotActive]} />
              <Text style={[styles.stepLabelText, i <= step && { color: colors.accent }, i === step && { color: colors.accentDark, fontFamily: 'Inter_600SemiBold' }]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Step 0: Service */}
        <AnimatedStep visible={step === 0}>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Elige un servicio</Text>
            <Text style={styles.stepSubtitle}>{company.name} ofrece los siguientes servicios</Text>
            <View style={styles.serviceList}>
              {companyServices.map((svc) => {
                const isSelected = selectedService?.id === svc.id;
                return (
                  <TouchableOpacity
                    key={svc.id}
                    activeOpacity={0.7}
                    onPress={() => setSelectedService(svc)}
                    style={[styles.svcCard, { backgroundColor: colors.white }, isSelected && styles.svcCardSelected]}
                  >
                    <View style={[styles.svcRadio, isSelected && { borderColor: colors.accent }]}>
                      {isSelected && <View style={[styles.svcRadioFill, { backgroundColor: colors.accent }]} />}
                    </View>
                    <View style={styles.svcInfo}>
                      <View style={styles.svcNameRow}>
                        <Text style={styles.svcName}>{svc.name}</Text>
                        <View style={[styles.svcBadge, { backgroundColor: colors.accentTint }]}>
                          <Icon source="star" size={10} color={colors.accent} />
                          <Text style={styles.svcBadgeText}>{company.rating}</Text>
                        </View>
                      </View>
                      <Text style={styles.svcDesc} numberOfLines={2}>{svc.description}</Text>
                      <View style={styles.svcMeta}>
                        <Text style={styles.svcPrice}>{formatCurrency(svc.price)}</Text>
                        <Text style={styles.svcSep}>/hora</Text>
                        <View style={styles.svcMetaDot} />
                        <Icon source="clock-outline" size={13} color={colors.gray400} />
                        <Text style={styles.svcTime}>{formatMinutes(svc.timeEstimate || 60)}</Text>
                      </View>
                    </View>
                    <Image source={{ uri: svc.image }} style={styles.svcImage} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </AnimatedStep>

        {/* Step 1: Date */}
        <AnimatedStep visible={step === 1}>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Elige una fecha</Text>
            <Text style={styles.stepSubtitle}>Selecciona el día para tu servicio</Text>
            <View style={styles.dateGrid}>
              {dates.map((d) => {
                const isSelected = selectedDate?.full === d.full;
                return (
                  <TouchableOpacity
                    key={d.full}
                    activeOpacity={0.7}
                    onPress={() => setSelectedDate(d)}
                    style={[styles.dateCard, { backgroundColor: colors.white }, isSelected && styles.dateCardSelected]}
                  >
                    <Text style={[styles.dateDay, isSelected && { color: colors.accent }]}>{d.dayName}</Text>
                    <Text style={[styles.dateNum, isSelected && { color: colors.white }]}>{d.dayNum}</Text>
                    <Text style={[styles.dateMonth, isSelected && { color: colors.accentTint }]}>{d.month}</Text>
                    {d.isToday && <View style={styles.dateBadge}><Text style={styles.dateBadgeText}>Hoy</Text></View>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </AnimatedStep>

        {/* Step 2: Time */}
        <AnimatedStep visible={step === 2}>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Elige un horario</Text>
            <Text style={styles.stepSubtitle}>Selecciona la hora para tu servicio</Text>
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map((t) => {
                const isSelected = selectedTime === t;
                const occupied = ['12:00', '15:00'].includes(t);
                return (
                  <TouchableOpacity
                    key={t}
                    activeOpacity={0.7}
                    disabled={occupied}
                    onPress={() => setSelectedTime(t)}
                    style={[
                      styles.timeCard, { backgroundColor: colors.white },
                      isSelected && styles.timeCardSelected,
                      occupied && styles.timeCardOccupied,
                    ]}
                  >
                    {occupied && <View style={styles.timeOccupiedBadge}><Text style={styles.timeOccupiedText}>Ocupado</Text></View>}
                    <Text style={[styles.timeText, isSelected && { color: colors.white }, occupied && { color: colors.gray300 }]}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </AnimatedStep>

        {/* Step 3: Address */}
        <AnimatedStep visible={step === 3}>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Dirección del servicio</Text>
            <Text style={styles.stepSubtitle}>¿Dónde quieres recibir el servicio?</Text>

            <TouchableOpacity activeOpacity={0.7} style={[styles.currentLocBtn, { backgroundColor: colors.accentTint }]}>
              <Icon source="crosshairs-gps" size={20} color={colors.accent} />
              <Text style={styles.currentLocText}>Usar ubicación actual</Text>
            </TouchableOpacity>

            {savedAddresses.map((addr) => (
              <TouchableOpacity
                key={addr.id}
                activeOpacity={0.7}
                onPress={() => { setSelectedAddress(addr); setShowCustomAddress(false); }}
                style={[styles.savedAddrCard, { backgroundColor: colors.white }, selectedAddress?.id === addr.id && styles.savedAddrSelected]}
              >
                <View style={[styles.addrIconWrap, { backgroundColor: colors.gray50 }]}>
                  <Icon source={addr.icon} size={20} color={colors.blue700} />
                </View>
                <View style={styles.addrInfo}>
                  <Text style={styles.addrLabel}>{addr.label}</Text>
                  <Text style={styles.addrText}>{addr.address}</Text>
                </View>
                <View style={[styles.addrRadio, selectedAddress?.id === addr.id && { borderColor: colors.accent }]}>
                  {selectedAddress?.id === addr.id && <View style={[styles.addrRadioFill, { backgroundColor: colors.accent }]} />}
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity activeOpacity={0.7} onPress={() => { setShowCustomAddress(true); setSelectedAddress(null); }} style={styles.addCustomBtn}>
              <Icon source="plus-circle-outline" size={20} color={colors.accent} />
              <Text style={styles.addCustomText}>Agregar otra dirección</Text>
            </TouchableOpacity>

            {showCustomAddress && (
              <View style={[styles.customAddrWrap, { backgroundColor: colors.white }]}>
                <Text style={styles.customAddrLabel}>Dirección</Text>
                <TextInput
                  style={[styles.customAddrInput, { color: colors.gray900, borderColor: colors.gray100 }]}
                  placeholder="Escribe tu dirección"
                  placeholderTextColor={colors.gray400}
                  value={customAddress}
                  onChangeText={setCustomAddress}
                />
              </View>
            )}
          </View>
        </AnimatedStep>

        {/* Step 4: Summary */}
        <AnimatedStep visible={step === 4}>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Confirma tu reserva</Text>
            <Text style={styles.stepSubtitle}>Revisa todos los detalles antes de confirmar</Text>

            <View style={[styles.summaryCard, { backgroundColor: colors.white }]}>
              {/* Company */}
              <View style={styles.summaryRow}>
                <View style={[styles.summaryIcon, { backgroundColor: getLogoBg(company.id) }]}>
                  <Text style={styles.summaryIconText}>{company.name.charAt(0)}</Text>
                </View>
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryLabel}>Empresa</Text>
                  <Text style={styles.summaryValue}>{company.name}</Text>
                </View>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.gray50 }]} />

              {/* Service */}
              <View style={styles.summaryRow}>
                <View style={[styles.summaryIconSm, { backgroundColor: colors.accentTint }]}>
                  <Icon source="washing-machine" size={18} color={colors.accent} />
                </View>
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryLabel}>Servicio</Text>
                  <Text style={styles.summaryValue}>{selectedService?.name || 'No seleccionado'}</Text>
                  <Text style={styles.summaryDesc} numberOfLines={1}>{selectedService?.description}</Text>
                </View>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.gray50 }]} />

              {/* Date & Time */}
              <View style={styles.summaryDouble}>
                <View style={styles.summaryDoubleItem}>
                  <View style={[styles.summaryIconSm, { backgroundColor: colors.gray50 }]}>
                    <Icon source="calendar-outline" size={18} color={colors.blue700} />
                  </View>
                  <View>
                    <Text style={styles.summaryLabel}>Fecha</Text>
                    <Text style={styles.summaryValue}>
                      {selectedDate ? `${selectedDate.dayName} ${selectedDate.dayNum} de ${selectedDate.month}` : 'No seleccionada'}
                    </Text>
                  </View>
                </View>
                <View style={styles.summaryDoubleItem}>
                  <View style={[styles.summaryIconSm, { backgroundColor: colors.gray50 }]}>
                    <Icon source="clock-outline" size={18} color={colors.blue700} />
                  </View>
                  <View>
                    <Text style={styles.summaryLabel}>Hora</Text>
                    <Text style={styles.summaryValue}>{selectedTime || 'No seleccionada'}</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.gray50 }]} />

              {/* Address */}
              <View style={styles.summaryRow}>
                <View style={[styles.summaryIconSm, { backgroundColor: colors.gray50 }]}>
                  <Icon source="map-marker-outline" size={18} color={colors.blue700} />
                </View>
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryLabel}>Dirección</Text>
                  <Text style={styles.summaryValue}>{finalAddress || 'No especificada'}</Text>
                </View>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.gray50 }]} />

              {/* Price */}
              <View style={styles.summaryTotal}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>{formatCurrency(selectedService?.price || 0)}</Text>
              </View>
              {selectedService && (
                <Text style={styles.summaryNote}>Precio por hora. El costo final puede variar según la duración del servicio.</Text>
              )}
            </View>
          </View>
        </AnimatedStep>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom navigation */}
      <View style={[styles.bottomNav, { backgroundColor: colors.white }]}>
        <View style={styles.bottomNavInner}>
          {step > 0 && (
            <TouchableOpacity onPress={() => setStep((s) => s - 1)} style={styles.backBtn}>
              <Icon source="arrow-left" size={20} color={colors.gray600} />
              <Text style={styles.backBtnText}>Atrás</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleNext}
            disabled={
              (step === 0 && !selectedService) ||
              (step === 1 && !selectedDate) ||
              (step === 2 && !selectedTime) ||
              (step === 3 && !finalAddress.trim())
            }
            style={[
              styles.nextBtn, { backgroundColor: colors.accent },
              ((step === 0 && !selectedService) || (step === 1 && !selectedDate) || (step === 2 && !selectedTime) || (step === 3 && !finalAddress.trim())) && { opacity: 0.5 },
            ]}
          >
            <Text style={styles.nextBtnText}>{step === STEPS.length - 1 ? 'Confirmar reserva' : 'Continuar'}</Text>
            {step < STEPS.length - 1 && <Icon source="arrow-right" size={20} color={colors.white} />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function ConfirmedView({ service, company, date, time, address, router }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.confirmedWrap}>
      <Animated.View style={[styles.confirmedCircle, { transform: [{ scale: scaleAnim }] }]}>
        <Icon source="check" size={48} color={colors.white} />
      </Animated.View>
      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', gap: 8 }}>
        <Text style={styles.confirmedTitle}>Tu reserva fue creada correctamente</Text>
        <Text style={styles.confirmedSubtitle}>
          {company?.name} · {date ? `${date.dayName} ${date.dayNum}` : ''} a las {time}
        </Text>
        <Text style={styles.confirmedAddress}>{address}</Text>
      </Animated.View>
      <Animated.View style={[styles.confirmedActions, { opacity: fadeAnim }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.back()}
          style={[styles.confirmedBtn, { backgroundColor: colors.accent }]}
        >
          <Icon source="eye-outline" size={20} color={colors.white} />
          <Text style={styles.confirmedBtnText}>Ver seguimiento</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => { router.back(); setTimeout(() => router.push('/(app)/services'), 300); }}
          style={[styles.confirmedBtnSecondary, { borderColor: colors.gray100 }]}
        >
          <Text style={styles.confirmedBtnSecondaryText}>Explorar más servicios</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function getLogoBg(id) {
  return LOGO_BG[((id || 1) - 1) % LOGO_BG.length];
}

import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  center: { justifyContent: 'center', alignItems: 'center', gap: 12 },
  centerText: { fontFamily: 'Inter_400Regular', fontSize: 16, color: colors.gray600 },

  /* ===== HEADER ===== */
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 20, paddingHorizontal: 16, paddingBottom: 0, ...shadows.sm },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerBack: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.blue900, flex: 1, textAlign: 'center' },

  /* ===== STEPPER ===== */
  stepper: { paddingHorizontal: 24, marginBottom: 8 },
  stepperTrack: { height: 4, backgroundColor: colors.gray100, borderRadius: 2 },
  stepperFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 2, transition: 'width 0.3s' },

  /* ===== STEP LABELS ===== */
  stepLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 28, paddingVertical: 12 },
  stepLabelItem: { alignItems: 'center', gap: 4, width: 60 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gray100 },
  stepDotActive: { width: 10, height: 10, borderRadius: 5, ...shadows.sm },
  stepLabelText: { fontFamily: 'Inter_400Regular', fontSize: 9, color: colors.gray400, textAlign: 'center' },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  /* ===== STEP CONTENT ===== */
  stepContent: { paddingHorizontal: 24, paddingTop: 8 },
  stepTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: colors.blue900, marginBottom: 6, letterSpacing: -0.2 },
  stepSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray600, marginBottom: 20 },

  /* ===== SERVICE SELECTION ===== */
  serviceList: { gap: 12 },
  svcCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radii.md, padding: 14, ...shadows.sm },
  svcCardSelected: { borderWidth: 1.5, borderColor: colors.accent },
  svcRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.gray300, alignItems: 'center', justifyContent: 'center' },
  svcRadioFill: { width: 10, height: 10, borderRadius: 5 },
  svcInfo: { flex: 1 },
  svcNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  svcName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.blue900, flex: 1 },
  svcBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.full },
  svcBadgeText: { fontFamily: 'Inter_500Medium', fontSize: 10, color: colors.accentDark },
  svcDesc: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray600, lineHeight: 17, marginBottom: 6 },
  svcMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  svcPrice: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.accent },
  svcSep: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray400 },
  svcMetaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.gray300, marginHorizontal: 4 },
  svcTime: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray600 },
  svcImage: { width: 56, height: 56, borderRadius: 10 },

  /* ===== DATE ===== */
  dateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dateCard: { width: (SCREEN_WIDTH - 48 - 24) / 7, borderRadius: radii.sm, paddingVertical: 10, alignItems: 'center', gap: 3, ...shadows.sm, position: 'relative' },
  dateCardSelected: { backgroundColor: colors.accent },
  dateDay: { fontFamily: 'Inter_500Medium', fontSize: 10, color: colors.gray400 },
  dateNum: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: colors.blue900 },
  dateMonth: { fontFamily: 'Inter_400Regular', fontSize: 9, color: colors.gray400 },
  dateBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: colors.accent, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
  dateBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 7, color: colors.white },

  /* ===== TIME ===== */
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeCard: { width: (SCREEN_WIDTH - 48 - 32) / 3, paddingVertical: 14, borderRadius: radii.sm, alignItems: 'center', ...shadows.sm, position: 'relative' },
  timeCardSelected: { backgroundColor: colors.accent },
  timeCardOccupied: { backgroundColor: colors.gray50, opacity: 0.8 },
  timeText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.blue900 },
  timeOccupiedBadge: { position: 'absolute', top: 2, right: 4 },
  timeOccupiedText: { fontFamily: 'Inter_500Medium', fontSize: 7, color: colors.gray400, textTransform: 'uppercase', letterSpacing: 0.3 },

  /* ===== ADDRESS ===== */
  currentLocBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 16, borderRadius: radii.md, marginBottom: 14 },
  currentLocText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.accentDark },
  savedAddrCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radii.md, padding: 14, marginBottom: 10, ...shadows.sm },
  savedAddrSelected: { borderWidth: 1.5, borderColor: colors.accent },
  addrIconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  addrInfo: { flex: 1 },
  addrLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.blue900 },
  addrText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600, marginTop: 1 },
  addrRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.gray300, alignItems: 'center', justifyContent: 'center' },
  addrRadioFill: { width: 10, height: 10, borderRadius: 5 },
  addCustomBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, marginBottom: 10 },
  addCustomText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.accent },
  customAddrWrap: { borderRadius: radii.md, padding: 14, ...shadows.sm },
  customAddrLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.blue900, marginBottom: 8 },
  customAddrInput: { height: 48, borderWidth: 1, borderRadius: radii.sm, paddingHorizontal: 14, fontFamily: 'Inter_400Regular', fontSize: 14 },

  /* ===== SUMMARY ===== */
  summaryCard: { borderRadius: radii.lg, padding: 20, gap: 0, ...shadows.md },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  summaryIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  summaryIconText: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: colors.white },
  summaryIconSm: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  summaryInfo: { flex: 1 },
  summaryLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray400, marginBottom: 1 },
  summaryValue: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.blue900 },
  summaryDesc: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray600, marginTop: 2 },
  summaryDivider: { height: 1 },
  summaryDouble: { flexDirection: 'row', gap: 16, paddingVertical: 12 },
  summaryDoubleItem: { flex: 1, flexDirection: 'row', gap: 10, alignItems: 'center' },
  summaryTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  summaryTotalLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.blue900 },
  summaryTotalValue: { fontFamily: 'Poppins_700Bold', fontSize: 24, color: colors.accent, letterSpacing: -0.3 },
  summaryNote: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray400, lineHeight: 15 },

  /* ===== BOTTOM NAV ===== */
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 32 : 12, borderTopWidth: 0.5, borderTopColor: colors.gray100 },
  bottomNavInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 14, paddingHorizontal: 12 },
  backBtnText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.gray600 },
  nextBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15, borderRadius: radii.full },
  nextBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.white },

  /* ===== CONFIRMATION ===== */
  confirmedWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 24 },
  confirmedCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  confirmedTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 22, color: colors.blue900, textAlign: 'center', lineHeight: 28, letterSpacing: -0.2 },
  confirmedSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, color: colors.gray600, textAlign: 'center', lineHeight: 20 },
  confirmedAddress: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray400, textAlign: 'center' },
  confirmedActions: { width: '100%', gap: 12, marginTop: 8 },
  confirmedBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: radii.full },
  confirmedBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.white },
  confirmedBtnSecondary: { alignItems: 'center', paddingVertical: 14, borderRadius: radii.full, borderWidth: 1 },
  confirmedBtnSecondaryText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.gray600 },
});
