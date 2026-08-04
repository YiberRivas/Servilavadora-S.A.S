import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Platform, Keyboard, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { formatCurrency } from '../../src/utils/formatters';
import { colors, radii, shadows } from '../../src/theme';
import { companiesService } from '../../src/services/companies.service';
import { requestService } from '../../src/services/request.service';
import AppButton from '../../src/components/ui/AppButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STEPS = [
  { key: 'capacity', label: 'Capacidad' },
  { key: 'address', label: 'Direccion' },
  { key: 'datetime', label: 'Fecha y hora' },
  { key: 'summary', label: 'Resumen' },
  { key: 'confirm', label: 'Confirmacion' },
];

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
];

const PAYMENT_METHODS = [
  { key: 'cash', label: 'Efectivo', icon: 'cash' },
  { key: 'nequi', label: 'Nequi', icon: 'cellphone' },
  { key: 'daviplata', label: 'Daviplata', icon: 'cellphone' },
  { key: 'transfer', label: 'Transferencia', icon: 'bank-transfer' },
];

const savedAddresses = [];

function generateDates() {
  const dates = [];
  const today = new Date();
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  for (let i = 0; i < 5; i++) {
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

const LOGO_COLORS = ['#12A594', '#1F4E79', '#8b5cf6', '#f59e0b', '#ef4444', '#0ea5e9', '#10b981'];

function getLogoBg(idx) {
  return LOGO_COLORS[((idx || 0)) % LOGO_COLORS.length];
}

export default function RequestServiceScreen() {
  const router = useRouter();
  const { companyId, capacityId, requestType } = useLocalSearchParams();
  const [company, setCompany] = useState(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dates = useMemo(() => generateDates(), []);

  const [step, setStep] = useState(0);
  const [selectedCapacity, setSelectedCapacity] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [customAddress, setCustomAddress] = useState('');
  const [customAddressDetails, setCustomAddressDetails] = useState('');
  const [showCustomAddress, setShowCustomAddress] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [observations, setObservations] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState({});

  const isNow = requestType === 'now';
  const progress = ((step + 1) / STEPS.length) * 100;

  useEffect(() => {
    if (!companyId) return;
    (async () => {
      try {
        const res = await companiesService.get(companyId);
        if (res.data) {
          const mapped = {
            id: res.data.uuid,
            name: res.data.nombre_comercial,
            description: res.data.descripcion || '',
            rating: 0,
            reviewCount: 0,
            capacities: (res.data.capacities || []).map((c, i) => ({
              id: c.id_capacidad_lavadora || i,
              kg: parseFloat(c.kg || c.capacidad_kg || 0),
              type: c.descripcion || c.type || 'Lavadora',
              price: c.price || c.valor_hora || 0,
              price_minuto: c.price_minuto || 0,
              available: c.available || c.disponibles || 0,
            })),
          };
          setCompany(mapped);
        }
      } catch (err) {
        console.error('Error loading company:', err);
      } finally {
        setIsLoadingCompany(false);
      }
    })();
  }, [companyId]);

  useEffect(() => {
    if (capacityId && company) {
      const cap = company.capacities?.find((c) => c.id === Number(capacityId) || c.kg === Number(capacityId));
      if (cap) {
        setSelectedCapacity(cap);
      }
    }
    if (isNow) {
      setSelectedDate(dates[0]);
    }
  }, [capacityId, company, isNow]);

  useEffect(() => {
    if (isNow && step === 2) {
      setSelectedDate(dates[0]);
    }
  }, [step, isNow]);

  const finalAddress = useMemo(() => {
    if (showCustomAddress && customAddress.trim()) {
      return customAddress.trim();
    }
    return selectedAddress?.address || '';
  }, [showCustomAddress, customAddress, selectedAddress]);

  const finalAddressDetails = useMemo(() => {
    if (showCustomAddress) {
      return customAddressDetails.trim();
    }
    return selectedAddress?.details || '';
  }, [showCustomAddress, customAddressDetails, selectedAddress]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const validateStep = useCallback((currentStep) => {
    const newErrors = {};

    switch (currentStep) {
      case 0:
        if (!selectedCapacity) {
          newErrors.capacity = 'Selecciona una capacidad';
        }
        break;
      case 1:
        if (!finalAddress) {
          newErrors.address = 'Selecciona o ingresa una direccion';
        }
        break;
      case 2:
        if (!selectedDate) {
          newErrors.date = 'Selecciona una fecha';
        }
        if (!selectedTime) {
          newErrors.time = 'Selecciona una hora';
        }
        break;
      case 3:
        if (observations.length > 500) {
          newErrors.observations = 'Maximo 500 caracteres';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedCapacity, finalAddress, selectedDate, selectedTime, observations]);

  const handleSubmit = useCallback(async () => {
    if (!company || !selectedCapacity || !finalAddress || !selectedDate || !selectedTime) return;
    setIsSubmitting(true);
    try {
      const fechaProgramada = `${selectedDate.full}T${selectedTime}:00`;
      await requestService.createSolicitud({
        empresa_uuid: company.id,
        capacidad_kg: selectedCapacity.kg,
        fecha_programada: fechaProgramada,
        direccion_entrega: finalAddress + (finalAddressDetails ? `, ${finalAddressDetails}` : ''),
        observaciones: observations,
      });
      setConfirmed(true);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo crear la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  }, [company, selectedCapacity, finalAddress, finalAddressDetails, selectedDate, selectedTime, observations]);

  const handleBack = useCallback(() => {
    if (confirmed) {
      router.back();
      return;
    }
    clearErrors();
    setStep((s) => Math.max(0, s - 1));
  }, [confirmed, clearErrors]);

  const handleGoToServices = useCallback(() => {
    router.back();
    setTimeout(() => router.push('/(app)/my-services'), 300);
  }, [router]);

  const handleEditStep = useCallback((targetStep) => {
    clearErrors();
    setStep(targetStep);
  }, [clearErrors]);

  const handleNext = useCallback(() => {
    if (!validateStep(step)) return;
    if (step === STEPS.length - 2) {
      handleSubmit();
      return;
    }
    Keyboard.dismiss();
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }, [step, validateStep, handleSubmit]);

  if (isLoadingCompany) {
    return (
      <View style={styles.screen}>
        <View style={[styles.header, { backgroundColor: colors.white }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
              <Icon source="arrow-left" size={22} color={colors.blue900} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cargando...</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </View>
    );
  }

  if (!company) {
    return (
      <View style={styles.center}>
        <Icon source="alert-circle-outline" size={48} color={colors.gray300} />
        <Text style={styles.centerText}>Empresa no encontrada</Text>
        <AppButton title="Volver" onPress={() => router.back()} variant="outline" icon="arrow-left" />
      </View>
    );
  }

  if (confirmed) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: colors.white }]}>
        <ConfirmedView
          company={company}
          capacity={selectedCapacity}
          address={finalAddress}
          date={selectedDate}
          time={selectedTime}
          paymentMethod={paymentMethod}
          onGoToServices={handleGoToServices}
        />
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
            {step === 0 ? 'Seleccionar capacidad' :
             step === 1 ? 'Direccion del servicio' :
             step === 2 ? 'Fecha y hora' :
             step === 3 ? 'Resumen' :
             'Confirmacion'}
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
            <Icon source="close" size={22} color={colors.blue900} />
          </TouchableOpacity>
        </View>

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

        <AnimatedStep visible={step === 0}>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Elige una capacidad</Text>
            <Text style={styles.stepSubtitle}>{company.name} ofrece las siguientes capacidades</Text>

            <View style={styles.companySummary}>
              <View style={[styles.companyLogo, { backgroundColor: getLogoBg(company.id) }]}>
                <Text style={styles.companyLogoText}>{company.name.charAt(0)}</Text>
              </View>
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>{company.name}</Text>
                <View style={styles.companyRatingRow}>
                  <Icon source="star" size={14} color={colors.accent} />
                  <Text style={styles.companyRating}>{company.rating}</Text>
                  <Text style={styles.companyReviews}>({company.reviewCount} resenas)</Text>
                </View>
              </View>
            </View>

            <View style={styles.capacityList}>
              {company.capacities?.filter(c => c.available > 0).map((capacity) => {
                const isSelected = selectedCapacity?.id === capacity.id;
                return (
                  <TouchableOpacity
                    key={capacity.id}
                    activeOpacity={0.7}
                    onPress={() => setSelectedCapacity(capacity)}
                    style={[styles.capacityCard, { backgroundColor: colors.white }, isSelected && styles.capacityCardSelected]}
                  >
                    <View style={styles.capacityTop}>
                      <View style={[styles.capacityIconWrap, { backgroundColor: colors.accentTint }]}>
                        <Icon source="washing-machine" size={24} color={colors.accent} />
                      </View>
                      <View style={styles.capacityInfo}>
                        <Text style={styles.capacityType}>{capacity.type}</Text>
                        <Text style={styles.capacityKg}>{capacity.kg} kg</Text>
                      </View>
                      <View style={[styles.capacityRadio, isSelected && { borderColor: colors.accent }]}>
                        {isSelected && <View style={[styles.capacityRadioFill, { backgroundColor: colors.accent }]} />}
                      </View>
                    </View>
                    <View style={styles.capacityBottom}>
                      <View style={styles.capacityPriceRow}>
                        <Text style={styles.capacityPrice}>{formatCurrency(capacity.price)}</Text>
                        <Text style={styles.capacityPriceUnit}>/ hora</Text>
                      </View>
                      <View style={styles.capacityAvailRow}>
                        <View style={[styles.capacityAvailDot, { backgroundColor: colors.accent }]} />
                        <Text style={styles.capacityAvailText}>{capacity.available} disponibles</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.capacity && <Text style={styles.errorText}>{errors.capacity}</Text>}
          </View>
        </AnimatedStep>

        <AnimatedStep visible={step === 1}>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Direccion del servicio</Text>
            <Text style={styles.stepSubtitle}>Donde quieres recibir el servicio?</Text>

            {savedAddresses.length > 0 && savedAddresses.map((addr) => (
              <TouchableOpacity
                key={addr.id}
                activeOpacity={0.7}
                onPress={() => { setSelectedAddress(addr); setShowCustomAddress(false); clearErrors(); }}
                style={[styles.savedAddrCard, { backgroundColor: colors.white }, selectedAddress?.id === addr.id && !showCustomAddress && styles.savedAddrSelected]}
              >
                <View style={[styles.addrIconWrap, { backgroundColor: colors.gray50 }]}>
                  <Icon source={addr.icon} size={20} color={colors.blue700} />
                </View>
                <View style={styles.addrInfo}>
                  <Text style={styles.addrLabel}>{addr.label}</Text>
                  <Text style={styles.addrText}>{addr.address}</Text>
                  {addr.details && <Text style={styles.addrDetails}>{addr.details}</Text>}
                </View>
                <View style={[styles.addrRadio, selectedAddress?.id === addr.id && !showCustomAddress && { borderColor: colors.accent }]}>
                  {selectedAddress?.id === addr.id && !showCustomAddress && <View style={[styles.addrRadioFill, { backgroundColor: colors.accent }]} />}
                </View>
              </TouchableOpacity>
            ))}

            {savedAddresses.length > 0 ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => { setShowCustomAddress(true); setSelectedAddress(null); clearErrors(); }}
                style={[styles.addCustomBtn, showCustomAddress && { backgroundColor: colors.accentTint }]}
              >
                <Icon source={showCustomAddress ? 'plus-circle' : 'plus-circle-outline'} size={20} color={colors.accent} />
                <Text style={styles.addCustomText}>Agregar otra direccion</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => { setShowCustomAddress(true); clearErrors(); }}
                style={[styles.addCustomBtn, { backgroundColor: colors.accentTint }]}
              >
                <Icon source="plus-circle" size={20} color={colors.accent} />
                <Text style={styles.addCustomText}>Agregar direccion</Text>
              </TouchableOpacity>
            )}

            {(showCustomAddress || savedAddresses.length === 0) && (
              <View style={[styles.customAddrWrap, { backgroundColor: colors.white }]}>
                <Text style={styles.customAddrLabel}>Direccion principal</Text>
                <TextInput
                  style={[styles.customAddrInput, { color: colors.gray900, borderColor: errors.address ? colors.error : colors.gray100 }]}
                  placeholder="Calle, carrera, avenida..."
                  placeholderTextColor={colors.gray400}
                  value={customAddress}
                  onChangeText={(v) => { setCustomAddress(v); clearErrors(); }}
                />
                <Text style={[styles.customAddrLabel, { marginTop: 12 }]}>Detalles (opcional)</Text>
                <TextInput
                  style={[styles.customAddrInput, { color: colors.gray900, borderColor: colors.gray100 }]}
                  placeholder="Apartamento, casa, piso, color del porton..."
                  placeholderTextColor={colors.gray400}
                  value={customAddressDetails}
                  onChangeText={setCustomAddressDetails}
                />
              </View>
            )}
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>
        </AnimatedStep>

        <AnimatedStep visible={step === 2}>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Fecha y hora</Text>
            <Text style={styles.stepSubtitle}>
              {isNow ? 'Selecciona la hora para tu servicio de hoy' : 'Selecciona la fecha y hora para tu servicio'}
            </Text>

            {!isNow && (
              <View style={styles.dateSection}>
                <Text style={styles.sectionLabel}>Fecha</Text>
                <View style={styles.dateGrid}>
                  {dates.map((d) => {
                    const isSelected = selectedDate?.full === d.full;
                    return (
                      <TouchableOpacity
                        key={d.full}
                        activeOpacity={0.7}
                        onPress={() => { setSelectedDate(d); clearErrors(); }}
                        style={[styles.dateCard, { backgroundColor: colors.white }, isSelected && styles.dateCardSelected]}
                      >
                        <Text style={[styles.dateDay, isSelected && { color: colors.white }]}>{d.dayName}</Text>
                        <Text style={[styles.dateNum, isSelected && { color: colors.white }]}>{d.dayNum}</Text>
                        <Text style={[styles.dateMonth, isSelected && { color: colors.accentTint }]}>{d.month}</Text>
                        {d.isToday && <View style={styles.dateBadge}><Text style={styles.dateBadgeText}>Hoy</Text></View>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
              </View>
            )}

            {isNow && (
              <View style={[styles.todayBanner, { backgroundColor: colors.accentTint }]}>
                <Icon source="clock-outline" size={20} color={colors.accent} />
                <View style={styles.todayInfo}>
                  <Text style={styles.todayLabel}>Servicio para hoy</Text>
                  <Text style={styles.todayDate}>{dates[0]?.dayName} {dates[0]?.dayNum} de {dates[0]?.month}</Text>
                </View>
              </View>
            )}

            <View style={styles.timeSection}>
              <Text style={styles.sectionLabel}>Hora</Text>
              <View style={styles.timeGrid}>
                {TIME_SLOTS.map((t) => {
                  const isSelected = selectedTime === t;
                  const occupied = ['12:00', '15:00'].includes(t);
                  return (
                    <TouchableOpacity
                      key={t}
                      activeOpacity={0.7}
                      disabled={occupied}
                      onPress={() => { setSelectedTime(t); clearErrors(); }}
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
              {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
            </View>

            <View style={styles.paymentSection}>
              <Text style={styles.sectionLabel}>Metodo de pago preferido</Text>
              <Text style={styles.paymentNote}>El pago se realizara al finalizar el servicio</Text>
              <View style={styles.paymentGrid}>
                {PAYMENT_METHODS.map((pm) => {
                  const isSelected = paymentMethod === pm.key;
                  return (
                    <TouchableOpacity
                      key={pm.key}
                      activeOpacity={0.7}
                      onPress={() => setPaymentMethod(pm.key)}
                      style={[styles.paymentCard, { backgroundColor: colors.white }, isSelected && styles.paymentCardSelected]}
                    >
                      <Icon source={pm.icon} size={22} color={isSelected ? colors.accent : colors.gray400} />
                      <Text style={[styles.paymentLabel, isSelected && { color: colors.accent }]}>{pm.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </AnimatedStep>

        <AnimatedStep visible={step === 3}>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Resumen de tu solicitud</Text>
            <Text style={styles.stepSubtitle}>Revisa todos los detalles antes de confirmar</Text>

            <View style={[styles.summaryCard, { backgroundColor: colors.white }]}>
              <TouchableOpacity onPress={() => handleEditStep(0)} style={styles.summaryRow}>
                <View style={[styles.summaryIcon, { backgroundColor: getLogoBg(company.id) }]}>
                  <Text style={styles.summaryIconText}>{company.name.charAt(0)}</Text>
                </View>
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryLabel}>Empresa y capacidad</Text>
                  <Text style={styles.summaryValue}>{company.name}</Text>
                  <Text style={styles.summaryDesc}>{selectedCapacity?.type} - {selectedCapacity?.kg} kg - {formatCurrency(selectedCapacity?.price)}/hora</Text>
                </View>
                <Icon source="chevron-right" size={20} color={colors.gray400} />
              </TouchableOpacity>
              <View style={[styles.summaryDivider, { backgroundColor: colors.gray50 }]} />

              <TouchableOpacity onPress={() => handleEditStep(1)} style={styles.summaryRow}>
                <View style={[styles.summaryIconSm, { backgroundColor: colors.gray50 }]}>
                  <Icon source="map-marker-outline" size={18} color={colors.blue700} />
                </View>
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryLabel}>Direccion</Text>
                  <Text style={styles.summaryValue}>{finalAddress || 'No especificada'}</Text>
                  {finalAddressDetails ? <Text style={styles.summaryDesc}>{finalAddressDetails}</Text> : null}
                </View>
                <Icon source="chevron-right" size={20} color={colors.gray400} />
              </TouchableOpacity>
              <View style={[styles.summaryDivider, { backgroundColor: colors.gray50 }]} />

              <TouchableOpacity onPress={() => handleEditStep(2)} style={styles.summaryDouble}>
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
                <Icon source="chevron-right" size={20} color={colors.gray400} />
              </TouchableOpacity>
              <View style={[styles.summaryDivider, { backgroundColor: colors.gray50 }]} />

              <View style={styles.summaryRow}>
                <View style={[styles.summaryIconSm, { backgroundColor: colors.accentTint }]}>
                  <Icon source="credit-card-outline" size={18} color={colors.accent} />
                </View>
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryLabel}>Metodo de pago</Text>
                  <Text style={styles.summaryValue}>{PAYMENT_METHODS.find(pm => pm.key === paymentMethod)?.label || 'Efectivo'}</Text>
                  <Text style={styles.summaryDesc}>El pago se realizara al finalizar el servicio</Text>
                </View>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.gray50 }]} />

              <View style={styles.summaryRow}>
                <View style={[styles.summaryIconSm, { backgroundColor: colors.gray50 }]}>
                  <Icon source="note-text-outline" size={18} color={colors.blue700} />
                </View>
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryLabel}>Observaciones</Text>
                  <Text style={styles.summaryValue}>{observations || 'Ninguna'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.observationSection}>
              <Text style={styles.sectionLabel}>Observaciones para la empresa (opcional)</Text>
              <TextInput
                style={[styles.observationInput, { color: colors.gray900, borderColor: errors.observations ? colors.error : colors.gray100 }]}
                placeholder="Ej: Apartamento, color del porton, punto de referencia, mascotas, instrucciones de ingreso..."
                placeholderTextColor={colors.gray400}
                value={observations}
                onChangeText={(v) => { setObservations(v); clearErrors(); }}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              <Text style={styles.observationCount}>{observations.length}/500</Text>
              {errors.observations && <Text style={styles.errorText}>{errors.observations}</Text>}
            </View>
          </View>
        </AnimatedStep>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.bottomNav, { backgroundColor: colors.white }]}>
        <View style={styles.bottomNavInner}>
          {step > 0 && (
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Icon source="arrow-left" size={20} color={colors.gray600} />
              <Text style={styles.backBtnText}>Atras</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleNext}
            disabled={
              isSubmitting ||
              (step === 0 && !selectedCapacity) ||
              (step === 1 && !finalAddress) ||
              (step === 2 && (!selectedDate || !selectedTime))
            }
            style={[
              styles.nextBtn, { backgroundColor: colors.accent },
              (isSubmitting || (step === 0 && !selectedCapacity) || (step === 1 && !finalAddress) || (step === 2 && (!selectedDate || !selectedTime))) && { opacity: 0.5 },
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Text style={styles.nextBtnText}>{step === STEPS.length - 2 ? 'Confirmar solicitud' : 'Continuar'}</Text>
                {step < STEPS.length - 2 && <Icon source="arrow-right" size={20} color={colors.white} />}
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function ConfirmedView({ company, capacity, address, date, time, paymentMethod, onGoToServices }) {
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
        <Text style={styles.confirmedTitle}>Solicitud creada correctamente</Text>
        <Text style={styles.confirmedSubtitle}>
          {company?.name} recibio tu solicitud
        </Text>
        <Text style={styles.confirmedDesc}>
          La empresa revisara tu solicitud y posteriormente asignara una lavadora y un repartidor.
        </Text>
      </Animated.View>

      <Animated.View style={[styles.confirmedDetails, { opacity: fadeAnim }]}>
        <View style={[styles.confirmedDetailCard, { backgroundColor: colors.gray50 }]}>
          <View style={styles.confirmedDetailRow}>
            <Icon source="washing-machine" size={18} color={colors.accent} />
            <Text style={styles.confirmedDetailText}>{capacity?.type} - {capacity?.kg} kg</Text>
          </View>
          <View style={styles.confirmedDetailRow}>
            <Icon source="map-marker-outline" size={18} color={colors.blue700} />
            <Text style={styles.confirmedDetailText} numberOfLines={2}>{address}</Text>
          </View>
          <View style={styles.confirmedDetailRow}>
            <Icon source="calendar-outline" size={18} color={colors.blue700} />
            <Text style={styles.confirmedDetailText}>{date?.dayName} {date?.dayNum} de {date?.month} a las {time}</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.confirmedActions, { opacity: fadeAnim }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onGoToServices}
          style={[styles.confirmedBtn, { backgroundColor: colors.accent }]}
        >
          <Icon source="format-list-bulleted" size={20} color={colors.white} />
          <Text style={styles.confirmedBtnText}>Ir a mis servicios</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => { }}
          style={[styles.confirmedBtnSecondary, { borderColor: colors.gray100 }]}
        >
          <Text style={styles.confirmedBtnSecondaryText}>Volver al inicio</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  center: { justifyContent: 'center', alignItems: 'center', gap: 12 },
  centerText: { fontFamily: 'Inter_400Regular', fontSize: 16, color: colors.gray600 },

  header: { paddingTop: Platform.OS === 'ios' ? 48 : 16, paddingHorizontal: 16, paddingBottom: 0, ...shadows.sm },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  headerBack: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: colors.blue900, flex: 1, textAlign: 'center' },

  stepper: { paddingHorizontal: 20, marginBottom: 4 },
  stepperTrack: { height: 3, backgroundColor: colors.gray100, borderRadius: 2 },
  stepperFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 2 },

  stepLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 8 },
  stepLabelItem: { alignItems: 'center', gap: 3, width: 56 },
  stepDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.gray100 },
  stepDotActive: { width: 9, height: 9, borderRadius: 5, ...shadows.sm },
  stepLabelText: { fontFamily: 'Inter_400Regular', fontSize: 8, color: colors.gray400, textAlign: 'center' },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  stepContent: { paddingHorizontal: 16, paddingTop: 4 },
  stepTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: colors.blue900, marginBottom: 4, letterSpacing: -0.2 },
  stepSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600, marginBottom: 14 },

  companySummary: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, padding: 10, borderRadius: radii.md, marginBottom: 12, ...shadows.sm },
  companyLogo: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  companyLogoText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.white },
  companyInfo: { flex: 1 },
  companyName: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.blue900, marginBottom: 1 },
  companyRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  companyRating: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: colors.blue900 },
  companyReviews: { fontFamily: 'Inter_400Regular', fontSize: 10, color: colors.gray400 },

  capacityList: { gap: 8 },
  capacityCard: { borderRadius: radii.md, padding: 10, ...shadows.sm },
  capacityCardSelected: { borderWidth: 1.5, borderColor: colors.accent },
  capacityTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  capacityIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  capacityInfo: { flex: 1 },
  capacityType: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.blue900, marginBottom: 1 },
  capacityKg: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray600 },
  capacityRadio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.gray300, alignItems: 'center', justifyContent: 'center' },
  capacityRadioFill: { width: 8, height: 8, borderRadius: 4 },
  capacityBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  capacityPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  capacityPrice: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: colors.accent },
  capacityPriceUnit: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray600 },
  capacityAvailRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  capacityAvailDot: { width: 5, height: 5, borderRadius: 3 },
  capacityAvailText: { fontFamily: 'Inter_500Medium', fontSize: 10, color: colors.accentDark },

  savedAddrCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: radii.md, padding: 10, marginBottom: 8, ...shadows.sm },
  savedAddrSelected: { borderWidth: 1.5, borderColor: colors.accent },
  addrIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addrInfo: { flex: 1 },
  addrLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.blue900 },
  addrText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray600, marginTop: 1 },
  addrDetails: { fontFamily: 'Inter_400Regular', fontSize: 10, color: colors.gray400, marginTop: 1 },
  addrRadio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.gray300, alignItems: 'center', justifyContent: 'center' },
  addrRadioFill: { width: 8, height: 8, borderRadius: 4 },
  addCustomBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: radii.md, marginBottom: 8 },
  addCustomText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.accent },
  customAddrWrap: { borderRadius: radii.md, padding: 12, ...shadows.sm },
  customAddrLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.blue900, marginBottom: 6 },
  customAddrInput: { height: 40, borderWidth: 1, borderRadius: radii.sm, paddingHorizontal: 12, fontFamily: 'Inter_400Regular', fontSize: 13 },

  todayBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 14, borderRadius: radii.md, marginBottom: 14 },
  todayInfo: { flex: 1 },
  todayLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.accentDark },
  todayDate: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.accentDark, marginTop: 1 },

  sectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.blue900, marginBottom: 8 },

  dateSection: { marginBottom: 14 },
  dateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dateCard: { width: (SCREEN_WIDTH - 48 - 24) / 5, borderRadius: radii.sm, paddingVertical: 8, alignItems: 'center', gap: 2, ...shadows.sm, position: 'relative' },
  dateCardSelected: { backgroundColor: colors.accent },
  dateDay: { fontFamily: 'Inter_500Medium', fontSize: 9, color: colors.gray400 },
  dateNum: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: colors.blue900 },
  dateMonth: { fontFamily: 'Inter_400Regular', fontSize: 8, color: colors.gray400 },
  dateBadge: { position: 'absolute', top: -3, right: -3, backgroundColor: colors.accent, paddingHorizontal: 3, paddingVertical: 1, borderRadius: 3 },
  dateBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 6, color: colors.white },

  timeSection: { marginBottom: 14 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  timeCard: { width: (SCREEN_WIDTH - 48 - 24) / 3, paddingVertical: 10, borderRadius: radii.sm, alignItems: 'center', ...shadows.sm, position: 'relative' },
  timeCardSelected: { backgroundColor: colors.accent },
  timeCardOccupied: { backgroundColor: colors.gray50, opacity: 0.8 },
  timeText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.blue900 },
  timeOccupiedBadge: { position: 'absolute', top: 2, right: 3 },
  timeOccupiedText: { fontFamily: 'Inter_500Medium', fontSize: 6, color: colors.gray400, textTransform: 'uppercase', letterSpacing: 0.3 },

  paymentSection: { marginBottom: 14 },
  paymentNote: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray400, marginBottom: 8, marginTop: -4 },
  paymentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  paymentCard: { width: (SCREEN_WIDTH - 48 - 18) / 2, flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 10, borderRadius: radii.sm, ...shadows.sm },
  paymentCardSelected: { borderWidth: 1.5, borderColor: colors.accent },
  paymentLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.gray600 },

  summaryCard: { borderRadius: radii.lg, padding: 14, gap: 0, ...shadows.md },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  summaryIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  summaryIconText: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: colors.white },
  summaryIconSm: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  summaryInfo: { flex: 1 },
  summaryLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: colors.gray400, marginBottom: 1 },
  summaryValue: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.blue900 },
  summaryDesc: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray600, marginTop: 1 },
  summaryDivider: { height: 1 },
  summaryDouble: { flexDirection: 'row', gap: 12, paddingVertical: 8, alignItems: 'center' },
  summaryDoubleItem: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center' },

  observationSection: { marginTop: 10 },
  observationInput: { borderWidth: 1, borderRadius: radii.md, padding: 10, fontFamily: 'Inter_400Regular', fontSize: 13, minHeight: 80, textAlignVertical: 'top' },
  observationCount: { fontFamily: 'Inter_400Regular', fontSize: 10, color: colors.gray400, textAlign: 'right', marginTop: 3 },

  errorText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.error, marginTop: 8 },

  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 24 : 8, borderTopWidth: 0.5, borderTopColor: colors.gray100 },
  bottomNavInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 10 },
  backBtnText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.gray600 },
  nextBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: radii.full },
  nextBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.white },

  confirmedWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 16 },
  confirmedCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  confirmedTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.blue900, textAlign: 'center', lineHeight: 24, letterSpacing: -0.2 },
  confirmedSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600, textAlign: 'center', lineHeight: 18 },
  confirmedDesc: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray400, textAlign: 'center', lineHeight: 16 },
  confirmedDetails: { width: '100%' },
  confirmedDetailCard: { borderRadius: radii.md, padding: 12, gap: 8 },
  confirmedDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confirmedDetailText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.blue900, flex: 1 },
  confirmedActions: { width: '100%', gap: 8 },
  confirmedBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: radii.full },
  confirmedBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.white },
  confirmedBtnSecondary: { alignItems: 'center', paddingVertical: 10, borderRadius: radii.full, borderWidth: 1 },
  confirmedBtnSecondaryText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.gray600 },
});