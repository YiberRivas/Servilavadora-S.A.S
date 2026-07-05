import React from 'react';
import { View, StyleSheet, ScrollView, Image, Linking } from 'react-native';
import { Text, Card, useTheme, IconButton, Chip, Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { companies } from '../../src/constants/mockData';
import AppButton from '../../src/components/ui/AppButton';

export default function CompanyDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const company = companies.find((c) => c.id === Number(id));

  if (!company) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text>Empresa no encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={{ uri: company.image }} style={styles.image} />
      
      <View style={styles.body}>
        <Text variant="headlineSmall" style={[styles.name, { color: colors.onBackground }]}>
          {company.name}
        </Text>

        <View style={styles.ratingRow}>
          <IconButton icon="star" size={18} iconColor="#FFC145" style={styles.starIcon} />
          <Text variant="bodyLarge" style={{ fontWeight: '600' }}>{company.rating}</Text>
        </View>

        <Card style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <View style={styles.infoRow}>
              <IconButton icon="map-marker" size={20} iconColor={colors.primary} style={styles.infoIcon} />
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, flex: 1 }}>{company.location}</Text>
            </View>
            <View style={styles.infoRow}>
              <IconButton icon="phone" size={20} iconColor={colors.primary} style={styles.infoIcon} />
              <Text variant="bodyMedium" style={{ color: colors.primary }} onPress={() => Linking.openURL(`tel:${company.phone}`)}>
                {company.phone}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <IconButton icon="email" size={20} iconColor={colors.primary} style={styles.infoIcon} />
              <Text variant="bodyMedium" style={{ color: colors.primary }}>{company.email}</Text>
            </View>
          </Card.Content>
        </Card>

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onBackground }]}>
          Descripción
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, lineHeight: 22 }}>
          {company.description}
        </Text>

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onBackground }]}>
          Servicios
        </Text>
        <View style={styles.servicesRow}>
          {company.services.map((service, index) => (
            <Chip key={index} style={styles.serviceChip} selectedColor={colors.primary} compact>
              {service}
            </Chip>
          ))}
        </View>

        <View style={styles.actions}>
          <AppButton
            title="Solicitar Servicio"
            onPress={() => router.push({ pathname: '/(modals)/request-service', params: { companyId: company.id } })}
          />
          <Button
            mode="outlined"
            onPress={() => Linking.openURL(`tel:${company.phone}`)}
            style={styles.callButton}
            icon="phone"
          >
            Llamar
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 250 },
  body: { padding: 24 },
  name: { fontWeight: '700', marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  starIcon: { margin: 0, width: 24 },
  infoCard: { borderRadius: 16, marginBottom: 24, elevation: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoIcon: { margin: 0, width: 36 },
  sectionTitle: { fontWeight: '600', marginBottom: 8, marginTop: 16 },
  servicesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  serviceChip: { borderRadius: 20 },
  actions: { marginTop: 16, gap: 12 },
  callButton: { borderRadius: 12, borderColor: '#ccc' },
});
