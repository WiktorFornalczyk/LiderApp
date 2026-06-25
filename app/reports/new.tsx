import Ionicons from '@expo/vector-icons/Ionicons';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen, Card, EmptySpacer, liderColors, SectionTitle } from '@/components/lider-ui';
import {
  formatParsedEntryForReport,
  ParsedReportEntry,
  parseReportOcrText,
} from '@/src/features/reports/services/reportOcrParser';
import * as reportRepository from '@/src/features/reports/services/reportRepository';

type ReportMode = 'start' | 'camera' | 'preview' | 'manual';

export default function NewReportScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<ReportMode>('start');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawText, setRawText] = useState('');
  const [parsedEntries, setParsedEntries] = useState<ParsedReportEntry[]>([]);
  const [draftEntries, setDraftEntries] = useState<string[]>([]);
  const [manualText, setManualText] = useState('');

  async function openCamera() {
    if (!permission?.granted) {
      const nextPermission = await requestPermission();

      if (!nextPermission.granted) {
        Alert.alert('Brak dostępu do aparatu', 'Zezwól na aparat, aby zrobić zdjęcie raportu.');
        return;
      }
    }

    setMode('camera');
  }

  async function takePhotoAndRunOcr() {
    if (!cameraRef.current || isProcessing) {
      return;
    }

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });
      const result = await TextRecognition.recognize(photo.uri);
      const nextRawText = result.text?.trim() ?? '';
      setRawText(nextRawText);
      setParsedEntries(parseReportOcrText(nextRawText));
      setMode('preview');

      if (!nextRawText) {
        Alert.alert('OCR nie odczytał tekstu', 'Możesz zrobić nowe zdjęcie albo wpisać raport ręcznie.');
      }
    } catch (error) {
      Alert.alert(
        'Nie udało się odczytać raportu',
        error instanceof Error ? error.message : 'Spróbuj zrobić zdjęcie ponownie albo wpisz raport ręcznie.'
      );
    } finally {
      setIsProcessing(false);
    }
  }

  function refreshParsedEntries(nextRawText = rawText) {
    setRawText(nextRawText);
    setParsedEntries(parseReportOcrText(nextRawText));
  }

  function addParsedEntriesToDraft() {
    const nextEntries = parsedEntries.map(formatParsedEntryForReport).filter(Boolean);

    if (nextEntries.length === 0) {
      Alert.alert('Brak wpisów', 'Popraw odczytany tekst albo wpisz raport ręcznie.');
      return;
    }

    setDraftEntries((current) => [...current, ...nextEntries]);
    setRawText('');
    setParsedEntries([]);
    setMode('start');
  }

  function addManualEntry() {
    const value = manualText.trim();

    if (!value) {
      Alert.alert('Pusty wpis', 'Wpisz treść pozycji raportu.');
      return;
    }

    setDraftEntries((current) => [...current, value]);
    setManualText('');
    setMode('start');
  }

  async function saveReport() {
    if (draftEntries.length === 0) {
      Alert.alert('Brak wpisów', 'Dodaj pozycje raportu ze zdjęcia albo ręcznie.');
      return;
    }

    try {
      await reportRepository.createReport(draftEntries);
      Alert.alert('Raport zapisany', `Zapisano ${draftEntries.length} pozycji raportu.`);
      router.replace('/reports' as never);
    } catch {
      Alert.alert('Nie udało się zapisać raportu', 'Spróbuj ponownie.');
    }
  }

  if (mode === 'camera') {
    return (
      <AppScreen title="Zdjęcie raportu" leftIcon="chevron-back" onLeftPress={() => setMode('start')}>
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Zrób zdjęcie kartki</Text>
          <Text style={styles.infoText}>
            Ustaw całą treść raportu w kadrze. OCR uruchomi się dopiero po wykonaniu zdjęcia.
          </Text>
        </Card>

        <EmptySpacer height={12} />

        <View style={styles.cameraFrame}>
          <CameraView ref={cameraRef} facing="back" style={styles.camera} />
          {isProcessing ? (
            <View style={styles.processingOverlay}>
              <ActivityIndicator color="#ffffff" />
              <Text style={styles.processingText}>Odczytywanie raportu...</Text>
            </View>
          ) : null}
        </View>

        <EmptySpacer height={12} />

        <View style={styles.actions}>
          <Pressable disabled={isProcessing} onPress={takePhotoAndRunOcr} style={[styles.primaryButton, isProcessing && styles.disabled]}>
            <Ionicons name="camera-outline" size={20} color="#ffffff" />
            <Text style={styles.primaryText}>Zrób zdjęcie</Text>
          </Pressable>
          <Pressable disabled={isProcessing} onPress={() => setMode('manual')} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Wpisz ręcznie</Text>
          </Pressable>
        </View>
      </AppScreen>
    );
  }

  if (mode === 'preview') {
    return (
      <AppScreen title="Podgląd OCR" leftIcon="chevron-back" onLeftPress={() => setMode('camera')}>
        <SectionTitle>Odczytany tekst</SectionTitle>
        <TextInput
          multiline
          onChangeText={refreshParsedEntries}
          placeholder="Odczytany tekst raportu"
          placeholderTextColor={liderColors.dim}
          style={styles.rawInput}
          textAlignVertical="top"
          value={rawText}
        />

        <EmptySpacer height={14} />

        <SectionTitle>Proponowane pozycje</SectionTitle>
        {parsedEntries.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>Brak rozpoznanych pozycji. Popraw tekst powyżej albo zrób nowe zdjęcie.</Text>
          </Card>
        ) : (
          <View style={styles.entryList}>
            {parsedEntries.map((entry) => (
              <Card key={entry.id} style={styles.entryCard}>
                <Text style={styles.entryTitle}>{formatParsedEntryForReport(entry)}</Text>
                <Text style={styles.entryMeta}>
                  Pewność: {Math.round(entry.confidence * 100)}%{entry.requiresReview ? ' · do sprawdzenia' : ''}
                </Text>
              </Card>
            ))}
          </View>
        )}

        <EmptySpacer height={14} />

        <View style={styles.actions}>
          <Pressable onPress={addParsedEntriesToDraft} style={styles.primaryButton}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
            <Text style={styles.primaryText}>Dodaj do raportu</Text>
          </Pressable>
          <Pressable onPress={() => setMode('camera')} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Nowe zdjęcie</Text>
          </Pressable>
        </View>
      </AppScreen>
    );
  }

  if (mode === 'manual') {
    return (
      <AppScreen title="Wpis ręczny" leftIcon="chevron-back" onLeftPress={() => setMode('start')}>
        <SectionTitle>Treść wpisu</SectionTitle>
        <TextInput
          multiline
          onChangeText={setManualText}
          placeholder="Np. L-I N330 P564327 BB10-20 plac 3"
          placeholderTextColor={liderColors.dim}
          style={styles.rawInput}
          textAlignVertical="top"
          value={manualText}
        />
        <EmptySpacer height={12} />
        <Pressable onPress={addManualEntry} style={styles.primaryButton}>
          <Ionicons name="add-circle-outline" size={20} color="#ffffff" />
          <Text style={styles.primaryText}>Dodaj wpis</Text>
        </Pressable>
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Nowy raport" leftIcon="chevron-back" onLeftPress={() => router.back()}>
      <SectionTitle>Tworzenie raportu</SectionTitle>
      <View style={styles.grid}>
        <ActionCard
          icon="camera-outline"
          title="Zdjęcie raportu"
          text="Zrób zdjęcie kartki i sprawdź odczytane wpisy przed dodaniem do raportu."
          onPress={openCamera}
        />
        <ActionCard
          icon="create-outline"
          title="Wpis ręczny"
          text="Dodaj punkty raportu ręcznie, gdy nie chcesz korzystać z OCR."
          onPress={() => setMode('manual')}
        />
      </View>

      <EmptySpacer height={18} />

      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>OCR raportu</Text>
        <Text style={styles.infoText}>
          Parser raportów rozpoznaje wpisy typu L-I N330 P564327 BB10-20 plac 3 oraz MW jako palety. Zapis wymaga
          zatwierdzenia użytkownika.
        </Text>
      </Card>

      <EmptySpacer height={18} />

      <SectionTitle>Roboczy raport</SectionTitle>
      {draftEntries.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>Brak pozycji raportu.</Text>
        </Card>
      ) : (
        <View style={styles.entryList}>
          {draftEntries.map((entry, index) => (
            <Card key={`${entry}-${index}`} style={styles.entryCard}>
              <Text style={styles.entryTitle}>{entry}</Text>
            </Card>
          ))}
          <Pressable onPress={saveReport} style={styles.primaryButton}>
            <Ionicons name="save-outline" size={20} color="#ffffff" />
            <Text style={styles.primaryText}>Zatwierdź raport</Text>
          </Pressable>
        </View>
      )}
    </AppScreen>
  );
}

function ActionCard({
  icon,
  title,
  text,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.actionCard}>
      <Ionicons name={icon} size={26} color={liderColors.blue} />
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionText}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 10,
  },
  actionCard: {
    minHeight: 126,
    gap: 8,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surface,
    padding: 14,
  },
  actionTitle: {
    color: liderColors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  actionText: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  infoCard: {
    gap: 8,
    padding: 14,
  },
  infoTitle: {
    color: liderColors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  infoText: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  cameraFrame: {
    height: 430,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
  },
  camera: {
    flex: 1,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  processingText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  rawInput: {
    minHeight: 170,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surface,
    color: liderColors.text,
    padding: 12,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  entryList: {
    gap: 10,
  },
  entryCard: {
    gap: 6,
    padding: 12,
  },
  entryTitle: {
    color: liderColors.text,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  entryMeta: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  emptyCard: {
    minHeight: 92,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  emptyText: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    backgroundColor: liderColors.blue,
    paddingHorizontal: 12,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    paddingHorizontal: 12,
  },
  secondaryText: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  disabled: {
    opacity: 0.55,
  },
});
