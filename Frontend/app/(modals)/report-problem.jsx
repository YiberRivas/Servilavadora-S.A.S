import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated, Platform, Alert, ActivityIndicator } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { REPORT_PROBLEMS } from '../../src/constants';
import { colors, radii, shadows } from '../../src/theme';
import apiClient from '../../src/api/client';
import endpoints from '../../src/api/endpoints';
import AppButton from '../../src/components/ui/AppButton';

export default function ReportProblemScreen() {
  const router = useRouter();
  const { serviceId } = useLocalSearchParams();
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!selectedProblem) {
      newErrors.problem = 'Selecciona un tipo de inconveniente';
    }
    if (selectedProblem === 'otro' && !description.trim()) {
      newErrors.description = 'Describe el problema';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedProblem, description]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const problemLabel = REPORT_PROBLEMS.find((p) => p.id === selectedProblem)?.label || selectedProblem;
      const desc = selectedProblem === 'otro' ? description : problemLabel;
      await apiClient.post(endpoints.tickets.create, {
        asunto: `Reporte: ${problemLabel}`,
        descripcion: desc,
        prioridad: 'MEDIA',
      });
      setSubmitted(true);
      Animated.spring(checkScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo enviar el reporte');
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, selectedProblem, description, checkScale]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleGoToService = useCallback(() => {
    router.back();
  }, [router]);

  const handleAddPhoto = useCallback(() => {
    Alert.alert('Adjuntar foto', 'Selecciona una opcion', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Camara' },
      { text: 'Galeria' },
    ]);
  }, []);

  if (submitted) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Animated.View style={[styles.successCircle, { transform: [{ scale: checkScale }] }]}>
          <Icon source="check" size={48} color={colors.white} />
        </Animated.View>
        <Text style={styles.successTitle}>Inconveniente reportado</Text>
        <Text style={styles.successSubtitle}>
          La empresa {`Lavadoras del Norte`} ha sido notificada.
        </Text>
        <Text style={styles.successDesc}>
          El equipo tecnico revisara tu reporte y se pondra en contacto contigo pronto.
        </Text>
        <TouchableOpacity
          onPress={handleGoToService}
          style={[styles.successBtn, { backgroundColor: colors.accent }]}
        >
          <Text style={styles.successBtnText}>Volver a mi servicio</Text>
        </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Reportar inconveniente</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.introText}>
            Selecciona el tipo de inconveniente que presentas con la lavadora.
          </Text>

          {/* PROBLEM LIST */}
          <View style={styles.problemList}>
            {REPORT_PROBLEMS.map((problem) => {
              const isSelected = selectedProblem === problem.id;
              return (
                <TouchableOpacity
                  key={problem.id}
                  activeOpacity={0.7}
                  onPress={() => { setSelectedProblem(problem.id); setErrors({}); }}
                  style={[
                    styles.problemItem,
                    { backgroundColor: colors.white },
                    isSelected && styles.problemItemSelected,
                  ]}
                >
                  <View style={[styles.problemIconWrap, { backgroundColor: isSelected ? colors.accentTint : colors.gray50 }]}>
                    <Icon source={problem.icon} size={20} color={isSelected ? colors.accent : colors.gray400} />
                  </View>
                  <Text style={[styles.problemLabel, isSelected && { color: colors.accent }]}>
                    {problem.label}
                  </Text>
                  <View style={[styles.problemRadio, isSelected && { borderColor: colors.accent }]}>
                    {isSelected && <View style={[styles.problemRadioFill, { backgroundColor: colors.accent }]} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.problem && <Text style={styles.errorText}>{errors.problem}</Text>}

          {/* DESCRIPTION (only for "Otro") */}
          {selectedProblem === 'otro' && (
            <View style={[styles.descSection, { backgroundColor: colors.white }]}>
              <Text style={styles.descLabel}>Describe el problema</Text>
              <TextInput
                style={[styles.descInput, { color: colors.gray900, borderColor: errors.description ? colors.error : colors.gray100 }]}
                placeholder="Ej: La lavadora hace un ruido fuerte al centrifugar..."
                placeholderTextColor={colors.gray400}
                value={description}
                onChangeText={(v) => { setDescription(v); setErrors({}); }}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              <Text style={styles.descCount}>{description.length}/500</Text>
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>
          )}

          {/* PHOTO ATTACHMENT */}
          <View style={[styles.photoSection, { backgroundColor: colors.white }]}>
            <Text style={styles.photoLabel}>Evidencia (opcional)</Text>
            <Text style={styles.photoHint}>Adjunta fotos del inconveniente para agilizar la revision.</Text>

            <View style={styles.photoGrid}>
              {photos.map((photo, idx) => (
                <View key={idx} style={[styles.photoThumb, { backgroundColor: colors.gray50 }]}>
                  <Icon source="image" size={24} color={colors.gray400} />
                </View>
              ))}
              {photos.length < 4 && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleAddPhoto}
                  style={[styles.photoAdd, { borderColor: colors.gray300 }]}
                >
                  <Icon source="camera-plus" size={24} color={colors.gray400} />
                  <Text style={styles.photoAddText}>Agregar</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={[styles.videoNote, { backgroundColor: colors.gray50 }]}>
              <Icon source="video-outline" size={16} color={colors.gray400} />
              <Text style={styles.videoNoteText}>Soporte para video proximamente</Text>
            </View>
          </View>

          {/* SUBMIT */}
          <View style={styles.submitSection}>
            <AppButton
              title={isSubmitting ? 'Enviando...' : 'Enviar reporte'}
              onPress={handleSubmit}
              variant="primary"
              fullWidth
              icon="send"
              disabled={isSubmitting}
            />
          </View>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  center: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 20, paddingHorizontal: 16, paddingBottom: 12, ...shadows.sm },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerBack: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: colors.blue900 },

  scroll: { flex: 1 },
  scrollContent: { paddingTop: 16, paddingBottom: 40 },

  introText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray600, paddingHorizontal: 16, marginBottom: 16 },

  problemList: { marginHorizontal: 16, gap: 8 },
  problemItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radii.md, ...shadows.sm },
  problemItemSelected: { borderWidth: 1.5, borderColor: colors.accent },
  problemIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  problemLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.blue900, flex: 1 },
  problemRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.gray300, alignItems: 'center', justifyContent: 'center' },
  problemRadioFill: { width: 10, height: 10, borderRadius: 5 },

  descSection: { marginHorizontal: 16, marginTop: 12, borderRadius: radii.md, padding: 16, ...shadows.sm },
  descLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.blue900, marginBottom: 8 },
  descInput: { borderWidth: 1, borderRadius: radii.sm, padding: 14, fontFamily: 'Inter_400Regular', fontSize: 14, minHeight: 100, textAlignVertical: 'top' },
  descCount: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray400, textAlign: 'right', marginTop: 4 },

  photoSection: { marginHorizontal: 16, marginTop: 12, borderRadius: radii.md, padding: 16, ...shadows.sm },
  photoLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.blue900, marginBottom: 4 },
  photoHint: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray400, marginBottom: 12 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoThumb: { width: 72, height: 72, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  photoAdd: { width: 72, height: 72, borderRadius: radii.sm, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoAddText: { fontFamily: 'Inter_500Medium', fontSize: 10, color: colors.gray400 },
  videoNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, padding: 10, borderRadius: radii.sm },
  videoNoteText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray400 },

  submitSection: { marginHorizontal: 16, marginTop: 20 },

  errorText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.error, marginTop: 8, marginHorizontal: 16 },

  successCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 22, color: colors.blue900, textAlign: 'center', marginBottom: 8 },
  successSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, color: colors.gray600, textAlign: 'center', marginBottom: 4 },
  successDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray400, textAlign: 'center', marginBottom: 32, lineHeight: 18 },
  successBtn: { paddingVertical: 16, paddingHorizontal: 32, borderRadius: radii.full },
  successBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.white },
});
