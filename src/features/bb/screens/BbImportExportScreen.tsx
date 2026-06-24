import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

import { Card, liderColors } from '@/components/lider-ui';
import * as bbBackupService from '../services/bbBackupService';

export function BbImportExportScreen({
  onImported,
  showExport = true,
}: {
  onImported: () => void;
  showExport?: boolean;
}) {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  async function exportData(includeArchived = false) {
    try {
      const result = await bbBackupService.exportBbDataToJson({ includeArchived });
      Alert.alert(
        'Eksport gotowy',
        result.uri
          ? `Plik ${result.fileName} zapisano: ${result.locationLabel}.`
          : `Wygenerowano JSON: ${result.fileName}`
      );
    } catch {
      Alert.alert('Nie udało się wyeksportować danych BB.');
    }
  }

  async function pickJsonFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/json', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      setSelectedFile(result.assets[0]);
    } catch {
      Alert.alert('Nie udało się wybrać pliku JSON.');
    }
  }

  async function importData(mode: 'merge' | 'replace') {
    if (!selectedFile) {
      Alert.alert('Wybierz plik JSON backupu przed importem.');
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
            onPress: () => {
              runImport(selectedFile.uri, 'replace');
            },
          },
        ]
      );
      return;
    }

    await runImport(selectedFile.uri, 'merge');
  }

  async function runImport(uri: string, mode: 'merge' | 'replace') {
    try {
      const summary = await bbBackupService.importBbDataFromJson(uri, mode);
      Alert.alert(
        'Import zakończony',
        `Dodano: ${summary.added}, zaktualizowano: ${summary.updated}, pominięto: ${summary.skipped}, konflikty: ${summary.conflicts}.`
      );
      onImported();
    } catch {
      Alert.alert('Nie udało się zaimportować pliku JSON.');
    }
  }

  return (
    <View style={styles.wrap}>
      {showExport ? (
        <Card style={styles.card}>
          <Text style={styles.title}>Eksport JSON</Text>
          <Text style={styles.text}>
            Domyślnie eksportowane są tylko aktywne BB i place potrzebne do ich przypisania. Na Androidzie wybierz
            folder Pobrane albo Dokumenty.
          </Text>
          <View style={styles.actions}>
            <Button label="Eksport aktywnych" onPress={() => exportData(false)} />
            <Button label="Eksport z archiwum" tone="amber" onPress={() => exportData(true)} />
          </View>
        </Card>
      ) : null}

      <Card style={styles.card}>
        <Text style={styles.title}>Import JSON</Text>
        <Text style={styles.text}>Wybierz cały plik backupu JSON z pamięci telefonu.</Text>
        <Pressable onPress={pickJsonFile} style={styles.filePicker}>
          <Text style={styles.filePickerText}>{selectedFile ? 'Zmień plik JSON' : 'Wybierz plik JSON'}</Text>
        </Pressable>
        {selectedFile ? (
          <View style={styles.selectedFile}>
            <Text style={styles.selectedFileName}>{selectedFile.name}</Text>
            {selectedFile.size ? <Text style={styles.selectedFileMeta}>{formatBytes(selectedFile.size)}</Text> : null}
          </View>
        ) : null}
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

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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
  filePicker: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: liderColors.blue,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    paddingHorizontal: 12,
  },
  filePickerText: {
    color: liderColors.blue,
    fontSize: 13,
    fontWeight: '900',
  },
  selectedFile: {
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    padding: 12,
    gap: 4,
  },
  selectedFileName: {
    color: liderColors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  selectedFileMeta: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '700',
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
