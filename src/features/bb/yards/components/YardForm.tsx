import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { liderColors } from '@/components/lider-ui';
import { Yard, YardInput } from '../types/yardTypes';
import { validateYard } from '../services/yardService';

export function YardForm({
  yard,
  onSubmit,
  onCancel,
}: {
  yard?: Yard | null;
  onSubmit: (input: YardInput) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(yard?.name ?? '');
  const [description, setDescription] = useState(yard?.description ?? '');
  const errors = useMemo(() => validateYard({ name, description }), [description, name]);
  const isValid = !Object.values(errors).some(Boolean);

  useEffect(() => {
    setName(yard?.name ?? '');
    setDescription(yard?.description ?? '');
  }, [yard]);

  return (
    <View style={styles.form}>
      <View style={styles.inputWrap}>
        <Text style={styles.label}>Nazwa placu</Text>
        <TextInput
          onChangeText={setName}
          placeholder="np. Plac Główny"
          placeholderTextColor={liderColors.dim}
          style={styles.input}
          value={name}
        />
        {errors.name ? <Text style={styles.error}>{errors.name}</Text> : null}
      </View>
      <View style={styles.inputWrap}>
        <Text style={styles.label}>Opis</Text>
        <TextInput
          multiline
          onChangeText={setDescription}
          placeholder="Opcjonalny opis"
          placeholderTextColor={liderColors.dim}
          style={[styles.input, styles.textArea]}
          value={description}
        />
        {errors.description ? <Text style={styles.error}>{errors.description}</Text> : null}
      </View>
      <View style={styles.actions}>
        {onCancel ? (
          <Pressable onPress={onCancel} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Anuluj</Text>
          </Pressable>
        ) : null}
        <Pressable
          disabled={!isValid}
          onPress={() => onSubmit({ name, description })}
          style={[styles.primaryButton, !isValid && styles.disabled]}>
          <Text style={styles.primaryText}>{yard ? 'Zapisz plac' : 'Dodaj plac'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
  },
  inputWrap: {
    gap: 5,
  },
  label: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '900',
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
  textArea: {
    minHeight: 90,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  error: {
    color: liderColors.red,
    fontSize: 11,
    fontWeight: '800',
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
