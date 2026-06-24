import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, liderColors, Pill } from '@/components/lider-ui';
import { BbRecordWithYard } from '../types/bbTypes';
import { formatBbRange } from '../utils/bbRangeUtils';
import { formatBool, formatDateTime, formatPallet } from '../utils/bbFormatUtils';

export function BbCard({ record, onPress }: { record: BbRecordWithYard; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.top}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Partia {record.nrPartii}</Text>
            <Text style={styles.subtitle}>
              {formatBbRange(record.bbOd, record.bbDo)} · {record.linia} · {record.yard.name}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={liderColors.muted} />
        </View>
        <Text style={styles.type}>{record.rodzajSadzy}</Text>
        <View style={styles.pills}>
          <Pill label={formatPallet(record.paleta)} tone={record.paleta === 'plastikowa' ? 'green' : 'amber'} />
          <Pill label={`Strecz: ${formatBool(record.strecz)}`} tone={record.strecz ? 'green' : 'neutral'} />
          <Pill
            label={`Kapturownica: ${formatBool(record.kapturownica)}`}
            tone={record.kapturownica ? 'green' : 'neutral'}
          />
        </View>
        <Text style={styles.meta}>Ostatnia edycja: {formatDateTime(record.updatedAt)}</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 9,
    padding: 14,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    color: liderColors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  type: {
    color: liderColors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  meta: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
});
