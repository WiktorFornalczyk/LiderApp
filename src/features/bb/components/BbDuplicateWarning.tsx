import { StyleSheet, Text } from 'react-native';

import { Card, liderColors } from '@/components/lider-ui';
import { BbDuplicateResult } from '../types/bbTypes';
import { getConflictMessage } from '../services/bbService';

export function BbDuplicateWarning({ conflict }: { conflict: BbDuplicateResult | null }) {
  if (!conflict) {
    return null;
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Sprawdź zakres BB</Text>
      <Text style={styles.message}>{getConflictMessage(conflict)}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
    borderColor: liderColors.amber,
    padding: 12,
  },
  title: {
    color: liderColors.amber,
    fontSize: 12,
    fontWeight: '900',
  },
  message: {
    color: liderColors.text,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
});
