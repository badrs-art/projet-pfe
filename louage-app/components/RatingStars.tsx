import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  note: number;
  onSelect: (note: number) => void;
}

export default function RatingStars({ note, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onSelect(star)}>
          <Text style={[styles.star, star <= note && styles.starActive]}>*</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10 },
  star: { fontSize: 36, opacity: 0.3, marginHorizontal: 5 },
  starActive: { opacity: 1 },
});
