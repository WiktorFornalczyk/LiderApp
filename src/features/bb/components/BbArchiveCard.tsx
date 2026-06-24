import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, liderColors } from '@/components/lider-ui';
import { BbRecordWithYard } from '../types/bbTypes';
import { formatBbRange } from '../utils/bbRangeUtils';
import { getDaysUntilPermanentDelete } from '../services/bbArchiveService';

export function BbArchiveCard({
  record,
  onRestore,
  onDelete,
  onPress,
  retentionDays,
}: {
  record: BbRecordWithYard;
  onRestore: () => void;
  onDelete: () => void;
  onPress: () => void;
  retentionDays: number;
}) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <Text style={styles.title}>
          Partia {record.nrPartii} · {formatBbRange(record.bbOd, record.bbDo)}
        </Text>
        <Text style={styles.meta}>
          {record.yard.name} · do automatycznego usunięcia: {getDaysUntilPermanentDelete(record.archivedAt, retentionDays)} dni
        </Text>
        <View style={styles.actions}>
          <Pressable onPress={onRestore} style={styles.restoreButton}>
            <Text style={styles.restoreText}>Przywróć</Text>
          </Pressable>
          <Pressable onPress={onDelete} style={styles.deleteButton}>
            <Text style={styles.deleteText}>Usuń trwale</Text>
          </Pressable>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    padding: 14,
  },
  title: {
    color: liderColors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  meta: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  restoreButton: {
    minHeight: 38,
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: liderColors.green,
    paddingHorizontal: 12,
  },
  deleteButton: {
    minHeight: 38,
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: liderColors.red,
    paddingHorizontal: 12,
  },
  restoreText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  deleteText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
});
