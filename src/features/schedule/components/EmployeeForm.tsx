import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { liderColors } from '@/components/lider-ui';
import { Employee, EmployeeInput } from '../types/employeeTypes';
import { validateEmployee } from '../services/employeeService';

export function EmployeeForm({
  employee,
  onSubmit,
  onCancel,
}: {
  employee?: Employee | null;
  onSubmit: (input: EmployeeInput) => void;
  onCancel?: () => void;
}) {
  const [fullName, setFullName] = useState(employee?.fullName ?? '');
  const [isActive, setIsActive] = useState(employee?.isActive ?? true);
  const errors = validateEmployee({ fullName, isActive });

  useEffect(() => {
    setFullName(employee?.fullName ?? '');
    setIsActive(employee?.isActive ?? true);
  }, [employee]);

  return (
    <View style={styles.form}>
      <View style={styles.inputWrap}>
        <Text style={styles.label}>Imię i nazwisko</Text>
        <TextInput
          onChangeText={setFullName}
          placeholder="np. Jan Kowalski"
          placeholderTextColor={liderColors.dim}
          style={styles.input}
          value={fullName}
        />
        {errors.fullName ? <Text style={styles.error}>{errors.fullName}</Text> : null}
      </View>

      <View style={styles.switchRow}>
        <View>
          <Text style={styles.switchTitle}>Aktywny pracownik</Text>
          <Text style={styles.switchSubtitle}>Nieaktywni mogą zostać ukryci z nowych grafików.</Text>
        </View>
        <Switch onValueChange={setIsActive} value={isActive} />
      </View>

      <View style={styles.actions}>
        {onCancel ? (
          <Pressable onPress={onCancel} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Anuluj</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={() => onSubmit({ fullName, isActive })} style={styles.primaryButton}>
          <Text style={styles.primaryText}>{employee ? 'Zapisz pracownika' : 'Dodaj pracownika'}</Text>
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
    gap: 6,
  },
  label: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '900',
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
  error: {
    color: liderColors.red,
    fontSize: 11,
    fontWeight: '800',
  },
  switchRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    padding: 12,
  },
  switchTitle: {
    color: liderColors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  switchSubtitle: {
    marginTop: 3,
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
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
    paddingHorizontal: 12,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryButton: {
    minHeight: 46,
    alignItems: 'center',
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
