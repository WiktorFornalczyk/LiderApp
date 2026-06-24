import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, liderColors } from '@/components/lider-ui';
import * as bbBackupService from '../services/bbBackupService';

export function BbImportExportScreen({ onImported }: { onImported: () => void }) {
  const [jsonText, setJsonText] = useState('');

  async function exportData(includeArchived = false) {
    const result = await bbBackupService.exportBbDataToJson({ includeArchived });
    Alert.alert(
      'Eksport gotowy',
      result.uri ? `Plik zapisano lokalnie: ${result.fileName}` : `Wygenerowano JSON: ${result.fileName}`
    );
  }

  async function importData(mode: 'merge' | 'replace') {
    if (!jsonText.trim()) {
      Alert.alert('Wklej JSON backupu przed importem.');
      return;
    }

    if (mode === 'replace') {
      Alert.alert(
        'Zastąpić dane BB?',
        'Obecne dane BB i placów zostaną zastąpione. Przed operacją aplikacja zapisze lokalną kopię obecnych danych BB.',
        [
          { text: 'Anuluj', style: 'cancel' },
          {
            text: 'Zastąp',
            style: 'destructive',
            onPress: async () => {
              const summary = await bbBackupService.importBbDataFromJson(jsonText, 'replace');
              Alert.alert('Import zakończony', `Dodano: ${summary.added}, zaktualizowano: ${summary.updated}, pominięto: ${summary.skipped}, konflikty: ${summary.conflicts}.`);
              onImported();
            },
          },
        ]
      );
      return;
    }

    const summary = await bbBackupService.importBbDataFromJson(jsonText, 'merge');
    Alert.alert('Import zakończony', `Dodano: ${summary.added}, zaktualizowano: ${summary.updated}, pominięto: ${summary.skipped}, konflikty: ${summary.conflicts}.`);
    onImported();
  }

  return (
    <View style={styles.wrap}>
      <Card style={styles.card}>
        <Text style={styles.title}>Eksport JSON</Text>
        <Text style={styles.text}>Domyślnie eksportowane są tylko aktywne BB i place potrzebne do ich przypisania.</Text>
        <View style={styles.actions}>
          <Button label="Eksport aktywnych" onPress={() => exportData(false)} />
          <Button label="Eksport z archiwum" tone="amber" onPress={() => exportData(true)} />
        </View>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.title}>Import JSON</Text>
        <TextInput
          multiline
          onChangeText={setJsonText}
          placeholder="Wklej zawartość backupu JSON"
          placeholderTextColor={liderColors.dim}
          style={styles.textArea}
          value={jsonText}
        />
        <View style={styles.actions}>
          <Button label="Połącz dane" onPress={() => importData('merge')} />
          <Button label="Zastąp dane BB" tone="red" onPress={() => importData('replace')} />
        </View>
      </Card>
    </View>
  );
}

function Button({ label, onPress, tone = 'blue' }: { label: string; onPress: () => void; tone?: 'blue' | 'amber' | 'red' }) {
  const color = tone === 'red' ? liderColors.red : tone === 'amber' ? liderColors.amber : liderColors.blue;

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
    gap: 12,
    padding: 14,
  },
  title: {
    color: liderColors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  text: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  textArea: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    color: liderColors.text,
    padding: 12,
    textAlignVertical: 'top',
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
