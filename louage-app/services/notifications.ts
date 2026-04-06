import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function demanderPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function notifierReservation(depart: string, arrivee: string, heure: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Reservation confirmee',
      body: `Votre trajet ${depart} -> ${arrivee} a ${heure} est reserve !`,
    },
    trigger: null,
  });
}

export async function notifierNouveauPassager(depart: string, arrivee: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Nouveau passager',
      body: `Un passager a reserve votre trajet ${depart} -> ${arrivee}`,
    },
    trigger: null,
  });
}
