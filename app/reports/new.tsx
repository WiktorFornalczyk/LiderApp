import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen, Card, EmptySpacer, liderColors, SectionTitle } from '@/components/lider-ui';
import {
  buildFormattedReport,
  getYesterdayIsoDate,
  ReportDraftEntry,
  ReportShiftNumber,
  ReportTemperatures,
} from '@/src/features/reports/services/reportFormatter';
import {
  formatParsedEntryForReport,
  ParsedReportEntry,
  parseReportOcrText,
} from '@/src/features/reports/services/reportOcrParser';
import * as reportRepository from '@/src/features/reports/services/reportRepository';
import { recognizeImageText } from '@/src/features/ocr/services/textRecognitionService';

type ReportMode = 'start' | 'camera' | 'preview' | 'manual';

const shiftNumbers: ReportShiftNumber[] = [1, 2, 3];

export default function NewReportScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<ReportMode>('start');
  const [selectedShift, setSelectedShift] = useState<ReportShiftNumber>(1);
  const [temperatures, setTemperatures] = useState<ReportTemperatures>({ 1: '', 2: '', 3: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawText, setRawText] = useState('');
  const [parsedEntries, setParsedEntries] = useState<ParsedReportEntry[]>([]);
  const [draftEntries, setDraftEntries] = useState<ReportDraftEntry[]>([]);
  const [manualText, setManualText] = useState('');
  const [cameraFacing, setCameraFacing] = useState<CameraType>('back');
  const filledShifts = shiftNumbers.filter((shiftNumber) => hasEntriesForShift(draftEntries, shiftNumber));
  const missingShifts = shiftNumbers.filter((shiftNumber) => !hasEntriesForShift(draftEntries, shiftNumber));
  const canGenerateReport = missingShifts.length === 0;

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
        quality: 1,
        skipProcessing: true,
      });
      const { rawText: nextRawText } = await recognizeImageText(photo.uri);
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

  function toggleCameraFacing() {
    setCameraFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  function addParsedEntriesToDraft() {
    if (parsedEntries.length === 0) {
      Alert.alert('Brak wpisów', 'Popraw odczytany tekst albo wpisz raport ręcznie.');
      return;
    }

    setDraftEntries((current) => [
      ...current,
      ...parsedEntries.map((entry) => ({
        id: `${entry.id}-${Date.now()}`,
        shiftNumber: selectedShift,
        parsedEntry: entry,
      })),
    ]);
    setRawText('');
    setParsedEntries([]);
    setMode('start');
  }

  function addManualEntry() {
    const nextParsedEntries = parseReportOcrText(manualText);

    if (nextParsedEntries.length === 0) {
      Alert.alert('Pusty wpis', 'Wpisz treść pozycji raportu.');
      return;
    }

    setDraftEntries((current) => [
      ...current,
      ...nextParsedEntries.map((entry) => ({
        id: `${entry.id}-${Date.now()}`,
        shiftNumber: selectedShift,
        parsedEntry: entry,
      })),
    ]);
    setManualText('');
    setMode('start');
  }

  function updateTemperature(shiftNumber: ReportShiftNumber, value: string) {
    setTemperatures((current) => ({ ...current, [shiftNumber]: value }));
  }

  async function saveReport() {
    if (draftEntries.length === 0) {
      Alert.alert('Brak wpisów', 'Dodaj pozycje raportu ze zdjęcia albo ręcznie.');
      return;
    }

    if (!canGenerateReport) {
      Alert.alert('Uzupełnij wszystkie zmiany', `Brakuje danych dla: ${missingShifts.map((shiftNumber) => `Zmiana ${shiftNumber}`).join(', ')}.`);
      return;
    }

    try {
      const formattedReport = await buildFormattedReport(draftEntries, temperatures);
      const sourceEntries = draftEntries.map((entry) => `Zmiana ${entry.shiftNumber}: ${formatParsedEntryForReport(entry.parsedEntry)}`);
      await reportRepository.createReport(formattedReport, sourceEntries);
      Alert.alert('Raport zapisany', 'Wygenerowano raport z OCR i podsumowaniem godzin z grafiku.');
      router.replace('/reports' as never);
    } catch {
      Alert.alert('Nie udało się zapisać raportu', 'Sprawdź grafik dla wczorajszego dnia i spróbuj ponownie.');
    }
  }

  if (mode === 'camera') {
    return (
      <AppScreen title="Zdjęcie raportu" leftIcon="chevron-back" onLeftPress={() => setMode('start')}>
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Zrób zdjęcie kartki</Text>
          <Text style={styles.infoText}>
            Odczyt z tego zdjęcia zostanie dopisany do: Zmiana {selectedShift}. Możesz zrobić kilka zdjęć do jednego raportu.
          </Text>
        </Card>

        <EmptySpacer height={12} />

        <View style={styles.cameraFrame}>
          <CameraView ref={cameraRef} autofocus="on" facing={cameraFacing} style={styles.camera} />
          <Pressable disabled={isProcessing} onPress={toggleCameraFacing} style={styles.rotateButton}>
            <Ionicons name="camera-reverse-outline" size={22} color="#ffffff" />
          </Pressable>
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
        <SectionTitle>Dodaj do zmiany</SectionTitle>
        <ShiftSelector selectedShift={selectedShift} onSelect={setSelectedShift} />

        <EmptySpacer height={12} />

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
                {entry.temperatures.length > 0 ? (
                  <Text style={styles.entryMeta}>Temperatury: {entry.temperatures.map((point) => `BB${point.bbNumber} ${point.value}°C`).join(', ')}</Text>
                ) : null}
              </Card>
            ))}
          </View>
        )}

        <EmptySpacer height={14} />

        <View style={styles.actions}>
          <Pressable onPress={addParsedEntriesToDraft} style={styles.primaryButton}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
            <Text style={styles.primaryText}>Dodaj zdjęcie do raportu</Text>
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
        <SectionTitle>Dodaj do zmiany</SectionTitle>
        <ShiftSelector selectedShift={selectedShift} onSelect={setSelectedShift} />

        <EmptySpacer height={12} />

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
          text="Dodaj kolejne zdjęcie OCR do tego samego raportu."
          onPress={openCamera}
        />
        <ActionCard
          icon="create-outline"
          title="Wpis ręczny"
          text="Dodaj pozycję ręcznie do wybranej zmiany."
          onPress={() => setMode('manual')}
        />
      </View>

      <EmptySpacer height={18} />

      <SectionTitle>Następny odczyt trafi do</SectionTitle>
      <ShiftSelector selectedShift={selectedShift} onSelect={setSelectedShift} />

      <EmptySpacer height={18} />

      <SectionTitle>Temperatura domyślna</SectionTitle>
      <Card style={styles.temperatureCard}>
        {shiftNumbers.map((shiftNumber) => (
          <View key={shiftNumber} style={styles.temperatureRow}>
            <Text style={styles.temperatureLabel}>Zmiana {shiftNumber}</Text>
            <TextInput
              keyboardType="numbers-and-punctuation"
              onChangeText={(value) => updateTemperature(shiftNumber, value)}
              placeholder="Gdy OCR nie odczyta temperatur"
              placeholderTextColor={liderColors.dim}
              style={styles.temperatureInput}
              value={temperatures[shiftNumber]}
            />
          </View>
        ))}
      </Card>

      <EmptySpacer height={18} />

      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>Format raportu</Text>
        <Text style={styles.infoText}>
          Raport zostanie wygenerowany dla daty {getYesterdayIsoDate()} i uzupełni raport godzinowy z grafiku dla tego dnia.
        </Text>
      </Card>

      <EmptySpacer height={18} />

      <SectionTitle>Roboczy raport</SectionTitle>
      {draftEntries.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>Brak pozycji raportu. Możesz dodać kilka zdjęć OCR przed zatwierdzeniem.</Text>
        </Card>
      ) : (
        <View style={styles.entryList}>
          {draftEntries.map((entry) => (
            <Card key={entry.id} style={styles.entryCard}>
              <Text style={styles.entryMeta}>Zmiana {entry.shiftNumber}</Text>
              <Text style={styles.entryTitle}>{formatParsedEntryForReport(entry.parsedEntry)}</Text>
            </Card>
          ))}
          <Card style={styles.progressCard}>
            <Text style={styles.progressTitle}>Uzupełnione zmiany: {filledShifts.length}/3</Text>
            <Text style={styles.progressText}>
              {canGenerateReport
                ? 'Wszystkie zmiany są uzupełnione. Możesz wygenerować i zapisać raport.'
                : `Brakuje: ${missingShifts.map((shiftNumber) => `Zmiana ${shiftNumber}`).join(', ')}.`}
            </Text>
          </Card>
          <Pressable disabled={!canGenerateReport} onPress={saveReport} style={[styles.primaryButton, !canGenerateReport && styles.disabled]}>
            <Ionicons name="save-outline" size={20} color="#ffffff" />
            <Text style={styles.primaryText}>{canGenerateReport ? 'Generuj i zapisz raport' : 'Uzupełnij zmiany 1, 2 i 3'}</Text>
          </Pressable>
        </View>
      )}
    </AppScreen>
  );
}

function hasEntriesForShift(entries: ReportDraftEntry[], shiftNumber: ReportShiftNumber) {
  return entries.some((entry) => entry.shiftNumber === shiftNumber);
}

function ShiftSelector({
  selectedShift,
  onSelect,
}: {
  selectedShift: ReportShiftNumber;
  onSelect: (shiftNumber: ReportShiftNumber) => void;
}) {
  return (
    <View style={styles.shiftSelector}>
      {shiftNumbers.map((shiftNumber) => (
        <Pressable
          key={shiftNumber}
          onPress={() => onSelect(shiftNumber)}
          style={[styles.shiftButton, selectedShift === shiftNumber && styles.shiftButtonActive]}>
          <Text style={[styles.shiftButtonText, selectedShift === shiftNumber && styles.shiftButtonTextActive]}>
            Zmiana {shiftNumber}
          </Text>
        </Pressable>
      ))}
    </View>
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
  shiftSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  shiftButton: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    paddingHorizontal: 8,
  },
  shiftButtonActive: {
    borderColor: liderColors.blue,
    backgroundColor: 'rgba(45,124,255,0.16)',
  },
  shiftButtonText: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  shiftButtonTextActive: {
    color: liderColors.blue,
  },
  temperatureCard: {
    gap: 10,
    padding: 12,
  },
  temperatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  temperatureLabel: {
    width: 78,
    color: liderColors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  temperatureInput: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    color: liderColors.text,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '800',
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
  rotateButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.58)',
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
  progressCard: {
    gap: 5,
    padding: 12,
  },
  progressTitle: {
    color: liderColors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  progressText: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
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
    textAlign: 'center',
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
