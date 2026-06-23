import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen, Card, EmptySpacer, liderColors, Pill, SectionTitle } from '@/components/lider-ui';

const batches = [
  {
    batch: '20240517',
    range: 'BB 001-025 • L-I',
    place: 'Plac Główny',
    type: 'Drewniana',
    added: 'Dzisiaj, 08:15',
    captured: false,
  },
  {
    batch: '20240516',
    range: 'BB 026-050 • L-I',
    place: 'Plac 2',
    type: 'Plastikowa',
    added: 'Wczoraj, 16:30',
    captured: false,
  },
  {
    batch: '20240515',
    range: 'BB 051-075 • L-II',
    place: 'Plac 2',
    type: 'Drewniana',
    added: 'Wczoraj, 10:20',
    captured: true,
  },
];

export default function BbScreen() {
  return (
    <AppScreen title="BigBagi" rightIcon="add-outline">
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={liderColors.muted} />
          <TextInput
            placeholder="Szukaj BB..."
            placeholderTextColor={liderColors.dim}
            style={styles.searchInput}
          />
        </View>
        <Pressable style={styles.filterButton}>
          <Ionicons name="filter-outline" size={17} color={liderColors.text} />
          <Text style={styles.filterText}>Filtry</Text>
        </Pressable>
      </View>

      <View style={styles.segmented}>
        <Text style={[styles.segment, styles.segmentActive]}>Aktywne</Text>
        <Text style={styles.segment}>Według placu</Text>
        <Text style={styles.segment}>Wszystkie</Text>
      </View>

      <SectionTitle>Plac Główny</SectionTitle>
      <View style={styles.list}>
        {batches.map((item) => (
          <Card key={item.batch} style={styles.batchCard}>
            <View style={styles.batchTop}>
              <View>
                <Text style={styles.batchTitle}>Partia: {item.batch}</Text>
                <Text style={styles.batchSub}>{item.range}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={liderColors.muted} />
            </View>
            <View style={styles.pills}>
              <Pill label={item.type} tone={item.type === 'Plastikowa' ? 'green' : 'amber'} />
              <Pill label="Strecz: Nie" />
              <Pill label={`Kapturownica: ${item.captured ? 'Tak' : 'Nie'}`} tone={item.captured ? 'green' : 'neutral'} />
            </View>
            <Text style={styles.added}>Dodano: {item.added} • {item.place}</Text>
          </Card>
        ))}
      </View>
      <EmptySpacer height={8} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: liderColors.surface,
  },
  searchInput: {
    flex: 1,
    color: liderColors.text,
    fontSize: 13,
    padding: 0,
  },
  filterButton: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: liderColors.surface,
  },
  filterText: {
    color: liderColors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  segmented: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 18,
    paddingHorizontal: 8,
  },
  segment: {
    color: liderColors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  segmentActive: {
    color: liderColors.blue,
  },
  list: {
    gap: 10,
  },
  batchCard: {
    padding: 14,
    gap: 10,
  },
  batchTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  batchTitle: {
    color: liderColors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  batchSub: {
    marginTop: 4,
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  added: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
});
