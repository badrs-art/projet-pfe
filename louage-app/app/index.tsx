import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Ionicons name="car-sport" size={18} color="#fff" />
            <Text style={styles.badgeText}>Louage.tn</Text>
          </View>

          <Text style={styles.title}>Voyagez entre les villes en toute simplicite</Text>
          <Text style={styles.subtitle}>
            Une application claire pour rechercher, reserver et publier des trajets de louage en Tunisie.
          </Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.button, styles.passengerButton]}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.9}
          >
            <View style={styles.buttonIcon}>
              <Ionicons name="people-outline" size={20} color="#B42318" />
            </View>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Espace passager</Text>
              <Text style={styles.buttonSubtitle}>Rechercher et reserver un trajet</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#B42318" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.driverButton]}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.9}
          >
            <View style={[styles.buttonIcon, styles.driverIcon]}>
              <Ionicons name="speedometer-outline" size={20} color="#175CD3" />
            </View>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Espace chauffeur</Text>
              <Text style={styles.buttonSubtitle}>Publier et gerer vos trajets</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#175CD3" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Transport inter-villes moderne, rapide et rassurant.</Text>
        </View>

        <View style={styles.topGlow} />
        <View style={styles.bottomGlow} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
    paddingVertical: 28,
    justifyContent: 'space-between',
  },
  hero: {
    marginTop: 24,
    gap: 18,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    color: '#fff',
    fontSize: 38,
    lineHeight: 46,
    fontWeight: '800',
    maxWidth: 320,
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 340,
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 28,
    padding: 18,
    gap: 14,
    shadowColor: '#020617',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  button: {
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  passengerButton: {
    backgroundColor: '#FEE4E2',
  },
  driverButton: {
    backgroundColor: '#DCEBFF',
  },
  buttonIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  driverIcon: {
    backgroundColor: '#F8FBFF',
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  buttonSubtitle: {
    color: '#475467',
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
  },
  topGlow: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(59,130,246,0.20)',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 170,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(239,68,68,0.20)',
  },
});
