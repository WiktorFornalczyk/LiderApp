import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, liderColors, SectionTitle } from '@/components/lider-ui';
import { BbCard } from '../../components/BbCard';
import { BbRecordWithYard } from '../../types/bbTypes';
import { YardWithStats } from '../types/yardTypes';
import * as yardService from '../services/yardService';

export function YardDetailsScreen({
  yard,
  records,
  onBack,
  onEdit,
  onDeleted,
  onSelectBb,
}: {
  yard: YardWithStats;
  records: BbRecordWithYard[];
  onBack: () => void;
  onEdit: () => void;
  onDeleted: () => void;
  onSelectBb: (record: BbRecordWithYard) => void;
}) {
  function deleteYard() {
    Alert.alert('Usunąć plac?', 'Plac zostanie usunięty tylko, jeśli nie ma aktywnych BB.', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          try {
            await yardService.deleteYard(yard.id);
            onDeleted();
          } catch (error) {
            Alert.alert('Nie udało się usunąć placu.', error instanceof Error ? error.message : undefined);
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.wrap}>
      <Card style={styles.card}>
        <Text style={styles.title}>{yard.name}</Text>
        <Text style={styles.description}>{yard.description || 'Brak opisu'}</Text>
        <Text style={styles.count}>Aktywne BB: {yard.activeBbCount}</Text>
        <View style={styles.actions}>
          <Button label="Wróć" onPress={onBack} tone="neutral" />
          <Button label="Edytuj plac" onPress={onEdit} />
          <Button label="Usuń plac" onPress={deleteYard} tone="red" />
        </View>
      </Card>

      <SectionTitle>BB na placu</SectionTitle>
      {records.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>Brak aktywnych BB na tym placu.</Text>
        </Card>
      ) : (
        <View style={styles.list}>
          {records.map((record) => (
            <BbCard key={record.id} record={record} onPress={() => onSelectBb(record)} />
          ))}
        </View>
      )}
    </View>
  );
}

function Button({ label, onPress, tone = 'blue' }: { label: string; onPress: () => void; tone?: 'blue' | 'red' | 'neutral' }) {
  const color = tone === 'red' ? liderColors.red : tone === 'neutral' ? liderColors.muted : liderColors.blue;
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={[styles.buttonText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  card: {
    gap: 8,
    padding: 14,
  },
  title: {
    color: liderColors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  description: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  count: {
    color: liderColors.blue,
    fontSize: 12,
    fontWeight: '900',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  button: {
    minHeight: 38,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    paddingHorizontal: 10,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '900',
  },
  list: {
    gap: 10,
  },
  emptyCard: {
    minHeight: 96,
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
