import { StyleSheet, Text, View } from 'react-native';

import { Card, liderColors } from '@/components/lider-ui';
import { BbRecordWithYard } from '../types/bbTypes';
import { formatBbRange } from '../utils/bbRangeUtils';
import { formatBool, formatDateTime, formatPallet } from '../utils/bbFormatUtils';

export function BbDetailsCard({ record }: { record: BbRecordWithYard }) {
  const rows = [
    ['Plac', record.yard.name],
    ['Nr partii', record.nrPartii],
    ['Rodzaj sadzy', record.rodzajSadzy],
    ['Zakres BB', formatBbRange(record.bbOd, record.bbDo)],
    ['Linia', record.linia],
    ['Paleta', formatPallet(record.paleta)],
    ['Strecz', formatBool(record.strecz)],
    ['Kapturownica', formatBool(record.kapturownica)],
    ['Uwagi', record.uwagi ?? '-'],
    ['Utworzono', formatDateTime(record.createdAt)],
    ['Ostatnia edycja', formatDateTime(record.updatedAt)],
  ];

  return (
    <Card style={styles.card}>
      {rows.map(([label, value]) => (
        <View key={label} style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      ))}
      {record.splitFromId ? <Text style={styles.splitInfo}>Ten zapis powstał z podziału wcześniejszego zakresu.</Text> : null}
      {record.status === 'split' ? <Text style={styles.splitInfo}>Ten pierwotny zakres został podzielony.</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: liderColors.borderSoft,
    paddingBottom: 8,
  },
  label: {
    width: 118,
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  value: {
    flex: 1,
    color: liderColors.text,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'right',
  },
  splitInfo: {
    color: liderColors.amber,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
});
