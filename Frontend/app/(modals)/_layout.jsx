import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, presentation: 'modal' }}>
      <Stack.Screen name="company-detail" />
      <Stack.Screen name="request-service" />
      <Stack.Screen name="active-service" />
      <Stack.Screen name="report-problem" />
      <Stack.Screen name="payment-methods" />
      <Stack.Screen name="payment-history" />
      <Stack.Screen name="payment-detail" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="driver-navigation" />
      <Stack.Screen name="route-tracking" />
      <Stack.Screen name="route-history" />
    </Stack>
  );
}
