import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapComponent from '../../components/MapView';
import RatingStars from '../../components/RatingStars';
import { addAvis, submitReservationRequest } from '../../services/api';

export default function BookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const trajetId = params.trajetId as string;
  const depart = params.depart as string;
  const arrivee = params.arrivee as string;
  const heure = params.heure as string;
  const prix = params.prix as string;
  const chauffeur = params.chauffeur as string;
  const telephone = params.telephone as string;
  const chauffeurId = params.chauffeurId as string;

  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [demandeEnvoyee, setDemandeEnvoyee] = useState(false);
  const [avisEnvoye, setAvisEnvoye] = useState(false);

  const handleCallAndRequest = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await submitReservationRequest(trajetId, token);
      setDemandeEnvoyee(true);

      const telUrl = `tel:${telephone}`;
      const canOpen = await Linking.canOpenURL(telUrl);
      if (canOpen) {
        await Linking.openURL(telUrl);
      }

      Alert.alert(
        'Demande envoyee',
        'Votre demande a ete envoyee au chauffeur. Appelez-le maintenant, puis attendez sa confirmation.'
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible d envoyer la demande.');
    }
  };

  const handleAvis = async () => {
    if (note === 0) {
      Alert.alert('Erreur', 'Veuillez choisir une note !');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      await addAvis({ chauffeur: chauffeurId, trajet: trajetId, note, commentaire }, token);
      setAvisEnvoye(true);
      Alert.alert('Merci', 'Votre avis a ete envoye !');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || "Impossible d'envoyer l'avis !");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Confirmation passager</Text>
        <Text style={styles.title}>Discutez d abord, confirmez ensuite</Text>
        <Text style={styles.subtitle}>
          Vous appelez le chauffeur, puis il decide s il vous confirme ou non.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.route}>{depart} {'->'} {arrivee}</Text>
        <Text style={styles.meta}>Heure: {heure}</Text>
        <Text style={styles.meta}>Prix: {prix} DT</Text>
        <Text style={styles.meta}>Chauffeur: {chauffeur}</Text>
        <Text style={styles.meta}>Telephone: {telephone}</Text>
      </View>

      <MapComponent depart={depart} arrivee={arrivee} />

      <TouchableOpacity
        style={[styles.primaryButton, demandeEnvoyee && styles.buttonDisabled]}
        onPress={handleCallAndRequest}
        disabled={demandeEnvoyee}
      >
        <Text style={styles.primaryButtonText}>
          {demandeEnvoyee ? 'Demande deja envoyee' : 'Appeler et envoyer ma demande'}
        </Text>
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Ensuite ?</Text>
        <Text style={styles.infoText}>Le chauffeur verra votre demande sur son ecran.</Text>
        <Text style={styles.infoText}>Il pourra confirmer avec `+` ou refuser avec `-`.</Text>
        <Text style={styles.infoText}>Les places diminuent seulement apres sa confirmation.</Text>
      </View>

      <View style={styles.avisCard}>
        <Text style={styles.avisTitle}>Laisser un avis apres votre trajet</Text>
        <RatingStars note={note} onSelect={setNote} />
        <TextInput
          style={styles.input}
          placeholder="Votre commentaire"
          value={commentaire}
          onChangeText={setCommentaire}
          multiline
        />
        <TouchableOpacity style={[styles.secondaryButton, avisEnvoye && styles.buttonDisabled]} onPress={handleAvis} disabled={avisEnvoye}>
          <Text style={styles.secondaryButtonText}>{avisEnvoye ? 'Avis envoye' : 'Envoyer l avis'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F4F7FB',
    padding: 20,
    gap: 16,
  },
  hero: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 22,
  },
  eyebrow: {
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 10,
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  route: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  meta: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 6,
  },
  primaryButton: {
    backgroundColor: '#DC2626',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#1D4ED8',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
  },
  infoCard: {
    backgroundColor: '#E0F2FE',
    borderRadius: 20,
    padding: 18,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 6,
  },
  avisCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
  },
  avisTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D9E2EC',
    borderRadius: 14,
    padding: 14,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  backText: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 10,
  },
});
