import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, liderColors } from '@/components/lider-ui';
import { BbInput, BbOcrResult } from '../types/bbTypes';

export function BbPhotoOcrPreview({
  result,
  nrPartii,
  rodzajSadzy,
  bbOd,
  bbDo,
  linia,
  placName,
  onNrPartiiChange,
  onRodzajSadzyChange,
  onBbOdChange,
  onBbDoChange,
  onLineChange,
  onPlacNameChange,
  onConfirm,
}: {
  result: BbOcrResult;
  nrPartii: string;
  rodzajSadzy: string;
  bbOd: string;
  bbDo: string;
  linia: BbInput['linia'];
  placName: string;
  onNrPartiiChange: (value: string) => void;
  onRodzajSadzyChange: (value: string) => void;
  onBbOdChange: (value: string) => void;
  onBbDoChange: (value: string) => void;
  onLineChange: (value: BbInput['linia']) => void;
  onPlacNameChange: (value: string) => void;
  onConfirm: () => void;
}) {
  return (
    <Card style={styles.card}>
      {result.imageUri ? <Image source={{ uri: result.imageUri }} style={styles.image} /> : null}

      <Text style={styles.label}>Pełny odczytany tekst</Text>
      <Text style={styles.rawText}>
        {result.error ? `OCR nie odczytał tekstu: ${result.error}` : result.rawText || 'Brak odczytanego tekstu.'}
      </Text>

      <Text style={styles.label}>Proponowane wartości</Text>
      <TextInput
        onChangeText={onNrPartiiChange}
        placeholder="Nr partii, np. 565499"
        placeholderTextColor={liderColors.dim}
        style={styles.input}
        value={nrPartii}
      />
      <TextInput
        onChangeText={onRodzajSadzyChange}
        placeholder="Rodzaj/gatunek sadzy, np. N339"
        placeholderTextColor={liderColors.dim}
        style={styles.input}
        value={rodzajSadzy}
      />
      <TextInput
        onChangeText={onPlacNameChange}
        placeholder="Plac, np. Plac 3"
        placeholderTextColor={liderColors.dim}
        style={styles.input}
        value={placName}
      />
      <View style={styles.row}>
        <TextInput
          keyboardType="number-pad"
          onChangeText={onBbOdChange}
          placeholder="BB od"
          placeholderTextColor={liderColors.dim}
          style={[styles.input, styles.rowInput]}
          value={bbOd}
        />
        <TextInput
          keyboardType="number-pad"
          onChangeText={onBbDoChange}
          placeholder="BB do"
          placeholderTextColor={liderColors.dim}
          style={[styles.input, styles.rowInput]}
          value={bbDo}
        />
      </View>
      <View style={styles.lineRow}>
        <Pressable onPress={() => onLineChange('L-I')} style={[styles.lineButton, linia === 'L-I' && styles.lineButtonActive]}>
          <Text style={[styles.lineText, linia === 'L-I' && styles.lineTextActive]}>L-I</Text>
        </Pressable>
        <Pressable onPress={() => onLineChange('L-II')} style={[styles.lineButton, linia === 'L-II' && styles.lineButtonActive]}>
          <Text style={[styles.lineText, linia === 'L-II' && styles.lineTextActive]}>L-II</Text>
        </Pressable>
      </View>

      <Pressable onPress={onConfirm} style={styles.button}>
        <Text style={styles.buttonText}>Potwierdź dane</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    padding: 14,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
  },
  label: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  rawText: {
    color: liderColors.text,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    color: liderColors.text,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowInput: {
    flex: 1,
  },
  lineRow: {
    flexDirection: 'row',
    gap: 10,
  },
  lineButton: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
  },
  lineButtonActive: {
    borderColor: liderColors.blue,
    backgroundColor: 'rgba(45, 124, 255, 0.16)',
  },
  lineText: {
    color: liderColors.muted,
    fontSize: 13,
    fontWeight: '900',
  },
  lineTextActive: {
    color: liderColors.blue,
  },
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: liderColors.blue,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
});
