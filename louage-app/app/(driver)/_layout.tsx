import { Stack } from 'expo-router';

export default function DriverLayout() {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ title: 'Mes trajets' }} />
      <Stack.Screen name="addTrip" options={{ title: 'Ajouter un trajet' }} />
    </Stack>
  );
}