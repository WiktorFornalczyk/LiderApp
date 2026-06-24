import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, liderColors, SectionTitle } from '@/components/lider-ui';
import { YardCard } from '../components/YardCard';
import { YardWithStats } from '../types/yardTypes';

export function YardListScreen({
  yards,
  onCreate,
  onSelect,
}: {
  yards: YardWithStats[];
  onCreate: () => void;
  onSelect: (yard: YardWithStats) => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <SectionTitle>Place</SectionTitle>
        <Pressable onPress={onCreate} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={18} color="#ffffff" />
          <Text style={styles.addText}>Dodaj plac</Text>
        </Pressable>
      </View>
      {yards.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>Brak placów. Dodaj pierwszy plac.</Text>
        </Card>
      ) : (
        <View style={styles.list}>
          {yards.map((yard) => (
            <YardCard key={yard.id} yard={yard} onPress={() => onSelect(yard)} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    backgroundColor: liderColors.blue,
    paddingHorizontal: 10,
  },
  addText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  list: {
    gap: 10,
  },
  emptyCard: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  emptyText: {
    color: liderColors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
});
