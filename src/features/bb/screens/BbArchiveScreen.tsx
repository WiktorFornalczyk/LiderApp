import { Alert, StyleSheet, Text, View } from 'react-native';

import { Card, liderColors } from '@/components/lider-ui';
import { BbArchiveCard } from '../components/BbArchiveCard';
import { BbRecordWithYard } from '../types/bbTypes';
import * as bbArchiveService from '../services/bbArchiveService';

export function BbArchiveScreen({
  records,
  onChanged,
  onSelect,
  retentionDays,
}: {
  records: BbRecordWithYard[];
  onChanged: () => void;
  onSelect: (record: BbRecordWithYard) => void;
  retentionDays: number;
}) {
  if (records.length === 0) {
    return (
      <Card style={styles.stateCard}>
        <Text style={styles.stateText}>Archiwum BB jest puste.</Text>
      </Card>
    );
  }

  return (
    <View style={styles.list}>
      {records.map((record) => (
        <BbArchiveCard
          key={record.id}
          record={record}
          retentionDays={retentionDays}
          onPress={() => onSelect(record)}
          onDelete={() =>
            Alert.alert(
              'Usunąć trwale?',
              'Tej operacji nie da się cofnąć. Czy na pewno chcesz trwale usunąć ten zapis BB?',
              [
                { text: 'Anuluj', style: 'cancel' },
                {
                  text: 'Usuń trwale',
                  style: 'destructive',
                  onPress: async () => {
                    await bbArchiveService.permanentlyDeleteBbRecord(record.id);
                    onChanged();
                  },
                },
              ]
            )
          }
          onRestore={() =>
            Alert.alert('Przywrócić BB?', 'Przed przywróceniem aplikacja sprawdzi konflikty zakresów.', [
              { text: 'Anuluj', style: 'cancel' },
              {
                text: 'Przywróć',
                onPress: async () => {
                  try {
                    await bbArchiveService.restoreBbRecord(record.id);
                    onChanged();
                  } catch (error) {
                    Alert.alert('Konflikt zakresu', error instanceof Error ? error.message : undefined, [
                      { text: 'Anuluj', style: 'cancel' },
                      {
                        text: 'Przywróć mimo to',
                        onPress: async () => {
                          await bbArchiveService.restoreBbRecord(record.id, { allowConflict: true });
                          onChanged();
                        },
                      },
                    ]);
                  }
                },
              },
            ])
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  stateCard: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  stateText: {
    color: liderColors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
});
