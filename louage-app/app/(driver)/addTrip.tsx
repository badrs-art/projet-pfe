import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { addTrajet } from '../../services/api';

export default function AddTrip() {
  const router = useRouter();
  const [depart, setDepart] = useState('');
  const [arrivee, setArrivee] = useState('');
  const [heure, setHeure] = useState('');
  const [places, setPlaces] = useState('');
  const [prix, setPrix] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!depart || !arrivee || !heure || !places || !prix) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs !');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      await addTrajet({ depart, arrivee, heure, places: Number(places), prix: Number(prix) }, token);
      Alert.alert('Succes', 'Trajet publie avec succes !', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de publier le trajet !');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Nouveau trajet</Text>
        <Text style={styles.title}>Publiez un trajet clair et attractif</Text>
        <Text style={styles.subtitle}>Choisissez vos villes, votre heure, vos places et votre prix.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Ville de depart</Text>
        <TextInput style={styles.input} placeholder="Ex: Jendouba" placeholderTextColor="#94A3B8" value={depart} onChangeText={setDepart} />

        <Text style={styles.label}>Ville d arrivee</Text>
        <TextInput style={styles.input} placeholder="Ex: Tunis" placeholderTextColor="#94A3B8" value={arrivee} onChangeText={setArrivee} />

        <Text style={styles.label}>Heure de depart</Text>
        <TextInput style={styles.input} placeholder="Ex: 08:00" placeholderTextColor="#94A3B8" value={heure} onChangeText={setHeure} />

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Places</Text>
            <TextInput style={styles.input} placeholder="4" placeholderTextColor="#94A3B8" value={places} onChangeText={setPlaces} keyboardType="numeric" />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Prix</Text>
            <TextInput style={styles.input} placeholder="15" placeholderTextColor="#94A3B8" value={prix} onChangeText={setPrix} keyboardType="numeric" />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handlePublish} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Publier le trajet</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Retour</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#EEF4FF',
    padding: 20,
  },
  hero: {
    backgroundColor: '#1E3A8A',
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
  },
  eyebrow: {
    color: '#BFDBFE',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 10,
  },
  subtitle: {
    color: '#DBEAFE',
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D7E3F4',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelText: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 15,
  },
});
