import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, liderColors } from '@/components/lider-ui';
import { BbPhotoOcrPreview } from '../components/BbPhotoOcrPreview';
import * as ocrService from '../services/ocrService';
import { BbInput, BbOcrResult } from '../types/bbTypes';
import { YardWithStats } from '../yards/types/yardTypes';

const OCR_GUIDE_RATIO = 0.42;

export function BbPhotoAddScreen({
  yards,
  onConfirmed,
  onCancel,
}: {
  yards: YardWithStats[];
  onConfirmed: (values: Partial<BbInput>) => void;
  onCancel: () => void;
}) {
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState<BbOcrResult | null>(null);
  const [suggestedValues, setSuggestedValues] = useState<Partial<BbInput>>({});
  const [placName, setPlacName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  async function takePhotoAndRunOcr() {
    if (!cameraRef.current || isProcessing) {
      return;
    }

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: false,
      });

      const nextResult = await ocrService.recognizeBbPhoto(photo.uri, {
        maxTextY: typeof photo.height === 'number' ? photo.height * OCR_GUIDE_RATIO : undefined,
      });
      const matchedPlacId = getMatchedYardId(nextResult.suggestedPlacName ?? '', yards);
      setResult(nextResult);
      setPlacName(nextResult.suggestedPlacName ?? '');
      setSuggestedValues({
        ...nextResult.suggestedValues,
        ...(matchedPlacId ? { placId: matchedPlacId } : {}),
      });

      if (nextResult.error) {
        Alert.alert('OCR nie odczytał tekstu', 'Możesz poprawić dane ręcznie na ekranie podglądu.');
      }
    } catch {
      Alert.alert('Nie udało się zrobić zdjęcia.', 'Spróbuj ponownie albo wpisz dane ręcznie.');
    } finally {
      setIsProcessing(false);
    }
  }

  function patchSuggestedValues(values: Partial<BbInput>) {
    setSuggestedValues((current) => ({ ...current, ...values }));
  }

  function handlePlacNameChange(value: string) {
    setPlacName(value);
    const matchedPlacId = getMatchedYardId(value, yards);
    patchSuggestedValues({ placId: matchedPlacId ?? '' });
  }

  if (!permission) {
    return (
      <Card style={styles.stateCard}>
        <ActivityIndicator color={liderColors.blue} />
        <Text style={styles.stateText}>Sprawdzanie uprawnień aparatu...</Text>
      </Card>
    );
  }

  if (!permission.granted) {
    return (
      <Card style={styles.stateCard}>
        <Ionicons name="camera-outline" size={32} color={liderColors.blue} />
        <Text style={styles.title}>Dodaj BB ze zdjęcia</Text>
        <Text style={styles.stateText}>
          Aplikacja potrzebuje dostępu do aparatu, aby zrobić pojedyncze zdjęcie etykiety lub dokumentu.
        </Text>
        <Pressable onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Zezwól na aparat</Text>
        </Pressable>
        <Pressable onPress={onCancel} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Wpisz ręcznie</Text>
        </Pressable>
      </Card>
    );
  }

  if (result) {
    return (
      <View style={styles.wrap}>
        <BbPhotoOcrPreview
          bbDo={String(suggestedValues.bbDo ?? '')}
          bbOd={String(suggestedValues.bbOd ?? '')}
          linia={suggestedValues.linia ?? ''}
          nrPartii={suggestedValues.nrPartii ?? ''}
          placName={placName}
          result={result}
          rodzajSadzy={suggestedValues.rodzajSadzy ?? ''}
          onBbDoChange={(bbDo) => patchSuggestedValues({ bbDo })}
          onBbOdChange={(bbOd) => patchSuggestedValues({ bbOd })}
          onConfirm={() => onConfirmed(suggestedValues)}
          onLineChange={(linia) => patchSuggestedValues({ linia })}
          onNrPartiiChange={(nrPartii) => patchSuggestedValues({ nrPartii })}
          onPlacNameChange={handlePlacNameChange}
          onRodzajSadzyChange={(rodzajSadzy) => patchSuggestedValues({ rodzajSadzy })}
        />
        <View style={styles.actions}>
          <Pressable onPress={() => setResult(null)} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Zrób nowe zdjęcie</Text>
          </Pressable>
          <Pressable onPress={onCancel} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Wpisz ręcznie</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Card style={styles.card}>
        <Text style={styles.title}>Dodaj BB ze zdjęcia</Text>
        <Text style={styles.stateText}>
          Ustaw odczytywaną linijkę tekstu nad niebieską linią. OCR uruchomi się dopiero po wykonaniu zdjęcia, a zapis będzie możliwy wyłącznie po zatwierdzeniu danych.
        </Text>
      </Card>

      <View style={styles.cameraFrame}>
        <CameraView ref={cameraRef} facing="back" style={styles.camera} />
        <View pointerEvents="none" style={styles.readAreaOverlay}>
          <View style={styles.readAreaShade} />
          <View style={styles.guideLineWrap}>
            <View style={styles.guideLine} />
            <View style={styles.guideLabel}>
              <Text style={styles.guideLabelText}>OCR czyta tylko tekst nad tą linią</Text>
            </View>
          </View>
          <View style={styles.ignoredAreaShade} />
        </View>
        {isProcessing ? (
          <View style={styles.processingOverlay}>
            <ActivityIndicator color="#ffffff" />
            <Text style={styles.processingText}>Odczytywanie tekstu...</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable disabled={isProcessing} onPress={takePhotoAndRunOcr} style={[styles.button, isProcessing && styles.disabled]}>
          <Ionicons name="camera-outline" size={20} color="#ffffff" />
          <Text style={styles.buttonText}>Zrób zdjęcie</Text>
        </Pressable>
        <Pressable disabled={isProcessing} onPress={onCancel} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Wpisz ręcznie</Text>
        </Pressable>
      </View>
    </View>
  );
}

function normalizePlacName(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/plac\s*0*(\d+)/, 'plac $1')
    .trim();
}

function getMatchedYardId(placName: string, yards: YardWithStats[]) {
  if (!placName.trim()) {
    return null;
  }

  const normalizedPlacName = normalizePlacName(placName);
  const placNumber = normalizedPlacName.match(/\d+/)?.[0] ?? null;
  const matchedYard = yards.find((yard) => {
    const normalizedYardName = normalizePlacName(yard.name);
    const yardNumber = normalizedYardName.match(/\d+/)?.[0] ?? null;

    return normalizedYardName === normalizedPlacName || (placNumber && yardNumber === placNumber);
  });

  return matchedYard?.id ?? null;
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  card: {
    gap: 8,
    padding: 14,
  },
  stateCard: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
  },
  title: {
    color: liderColors.text,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  stateText: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
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
  readAreaOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  readAreaShade: {
    height: `${OCR_GUIDE_RATIO * 100}%`,
    backgroundColor: 'rgba(45,124,255,0.06)',
  },
  guideLineWrap: {
    minHeight: 1,
  },
  guideLine: {
    height: 3,
    backgroundColor: liderColors.blue,
    shadowColor: liderColors.blue,
    shadowOpacity: 0.55,
    shadowRadius: 8,
  },
  guideLabel: {
    alignSelf: 'center',
    marginTop: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.62)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  guideLabelText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  ignoredAreaShade: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.34)',
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
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
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
  disabled: {
    opacity: 0.55,
  },
  buttonText: {
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
});
