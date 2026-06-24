import { Alert, StyleSheet, Text, View } from 'react-native';

import { Card, liderColors, SectionTitle } from '@/components/lider-ui';
import { EmployeeForm } from '../components/EmployeeForm';
import { Employee, EmployeeInput } from '../types/employeeTypes';
import * as employeeService from '../services/employeeService';

export function EmployeeEditScreen({
  employee,
  onSaved,
  onCancel,
}: {
  employee?: Employee | null;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  async function handleSubmit(input: EmployeeInput) {
    try {
      const duplicate = await employeeService.hasActiveEmployeeWithName(input.fullName, employee?.id);

      if (duplicate) {
        Alert.alert(
          'Podobny pracownik',
          'Aktywny pracownik o takim imieniu i nazwisku już istnieje. Sprawdź, czy nie tworzysz duplikatu.',
          [
            { text: 'Anuluj', style: 'cancel' },
            {
              text: 'Zapisz mimo to',
              onPress: () => save(input),
            },
          ]
        );
        return;
      }

      await save(input);
    } catch (error) {
      Alert.alert('Nie udało się zapisać pracownika.', error instanceof Error ? error.message : undefined);
    }
  }

  async function save(input: EmployeeInput) {
    if (employee) {
      await employeeService.updateEmployee(employee.id, input);
    } else {
      await employeeService.createEmployee(input);
    }

    onSaved();
  }

  return (
    <View>
      <SectionTitle>{employee ? 'Edycja pracownika' : 'Nowy pracownik'}</SectionTitle>
      <Card style={styles.card}>
        <EmployeeForm employee={employee} onCancel={onCancel} onSubmit={handleSubmit} />
        <Text style={styles.hint}>
          Dezaktywacja jest bezpieczniejsza niż usunięcie, bo wcześniejsze grafiki zostają czytelne.
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 12,
  },
  hint: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
});
