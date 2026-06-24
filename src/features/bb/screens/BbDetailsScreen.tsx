import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { liderColors } from '@/components/lider-ui';
import { BbDetailsCard } from '../components/BbDetailsCard';
import { BbSplitModal } from '../components/BbSplitModal';
import { BbRecordWithYard } from '../types/bbTypes';
import * as bbArchiveService from '../services/bbArchiveService';
import * as bbSplitService from '../services/bbSplitService';
import { useState } from 'react';

export function BbDetailsScreen({
  record,
  onEdit,
  onDuplicate,
  onArchived,
  onSplit,
  onBack,
}: {
  record: BbRecordWithYard;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchived: () => void;
  onSplit: () => void;
  onBack: () => void;
}) {
  const [splitVisible, setSplitVisible] = useState(false);

  function archive() {
    Alert.alert('Zarchiwizować BB?', 'Zapis będzie można przywrócić przez 7 dni.', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Archiwizuj',
        style: 'destructive',
        onPress: async () => {
          await bbArchiveService.archiveBbRecord(record.id);
          onArchived();
        },
      },
    ]);
  }

  async function split(splitAfterNumber: number) {
    await bbSplitService.splitBbRecord(record.id, splitAfterNumber);
    setSplitVisible(false);
    Alert.alert('Podzielono partię', 'Powstały dwa osobne aktywne zapisy BB.');
    onSplit();
  }

  return (
    <View style={styles.wrap}>
      <BbDetailsCard record={record} />
      <View style={styles.actions}>
        <Button label="Wróć" tone="neutral" onPress={onBack} />
        <Button label="Edytuj" onPress={onEdit} />
        <Button label="Podziel partię" tone="amber" onPress={() => setSplitVisible(true)} />
        <Button label="Duplikuj" tone="green" onPress={onDuplicate} />
        <Button label="Archiwizuj" tone="red" onPress={archive} />
      </View>
      <BbSplitModal
        record={record}
        visible={splitVisible}
        onClose={() => setSplitVisible(false)}
        onConfirm={split}
      />
    </View>
  );
}

function Button({
  label,
  onPress,
  tone = 'blue',
}: {
  label: string;
  onPress: () => void;
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'neutral';
}) {
  const color =
    tone === 'green'
      ? liderColors.green
      : tone === 'amber'
        ? liderColors.amber
        : tone === 'red'
          ? liderColors.red
          : tone === 'neutral'
            ? liderColors.muted
            : liderColors.blue;

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
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    minHeight: 42,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '900',
  },
});
