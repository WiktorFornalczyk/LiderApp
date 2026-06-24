import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { liderColors } from '@/components/lider-ui';
import { BbRecord } from '../types/bbTypes';
import { formatBbRange, previewSplitRange } from '../utils/bbRangeUtils';

export function BbSplitModal({
  visible,
  record,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  record: BbRecord | null;
  onClose: () => void;
  onConfirm: (splitAfterNumber: number) => void;
}) {
  const [value, setValue] = useState('');
  const splitAfter = Number(value);
  const preview = useMemo(() => (record ? previewSplitRange(record, splitAfter) : null), [record, splitAfter]);
  const isValid = Boolean(preview);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Podziel partię</Text>
          {record ? <Text style={styles.current}>Aktualny zakres: {formatBbRange(record.bbOd, record.bbDo)}</Text> : null}
          <TextInput
            keyboardType="number-pad"
            onChangeText={setValue}
            placeholder="Podziel po numerze BB"
            placeholderTextColor={liderColors.dim}
            style={styles.input}
            value={value}
          />
          {preview ? (
            <View style={styles.preview}>
              <Text style={styles.previewText}>Zakres 1: {formatBbRange(preview.first.bbOd, preview.first.bbDo)}</Text>
              <Text style={styles.previewText}>Zakres 2: {formatBbRange(preview.second.bbOd, preview.second.bbDo)}</Text>
            </View>
          ) : (
            <Text style={styles.hint}>Punkt podziału musi mieścić się w zakresie i być mniejszy niż numer końcowy.</Text>
          )}
          <Text style={styles.warning}>
            Po podziale powstaną dwa osobne zapisy BB. Tej operacji nie należy wykonywać, jeśli zakres został wybrany błędnie.
          </Text>
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>Anuluj</Text>
            </Pressable>
            <Pressable disabled={!isValid} onPress={() => onConfirm(splitAfter)} style={[styles.primaryButton, !isValid && styles.disabled]}>
              <Text style={styles.primaryText}>Zatwierdź podział</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  sheet: {
    gap: 12,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: liderColors.border,
    backgroundColor: liderColors.surface,
    padding: 16,
  },
  title: {
    color: liderColors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  current: {
    color: liderColors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    color: liderColors.text,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '800',
  },
  preview: {
    gap: 5,
  },
  previewText: {
    color: liderColors.green,
    fontSize: 13,
    fontWeight: '900',
  },
  hint: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  warning: {
    color: liderColors.amber,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: liderColors.blue,
  },
  disabled: {
    opacity: 0.55,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryButton: {
    minHeight: 46,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  secondaryText: {
    color: liderColors.muted,
    fontSize: 13,
    fontWeight: '900',
  },
});
