import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, liderColors, SectionTitle } from '@/components/lider-ui';
import { Employee } from '../types/employeeTypes';
import * as employeeService from '../services/employeeService';
import { EmployeeEditScreen } from './EmployeeEditScreen';

export function EmployeeListScreen({ onChanged }: { onChanged?: () => void }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState<Employee | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  async function loadEmployees() {
    setIsLoading(true);
    const nextEmployees = await employeeService.getEmployees({ includeInactive: true });
    setEmployees(nextEmployees);
    setIsLoading(false);
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  async function handleSaved() {
    setEditedEmployee(null);
    setIsCreating(false);
    await loadEmployees();
    onChanged?.();
  }

  function deactivate(employee: Employee) {
    Alert.alert(
      'Dezaktywować pracownika?',
      'Pracownik zostanie ukryty z nowych grafików, ale jego wcześniejsze wpisy pozostaną zapisane.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Dezaktywuj',
          style: 'destructive',
          onPress: async () => {
            await employeeService.deactivateEmployee(employee.id);
            await handleSaved();
          },
        },
      ]
    );
  }

  function deleteEmployee(employee: Employee) {
    Alert.alert(
      'Trwale usunąć pracownika?',
      'Trwałe usunięcie pracownika może wpłynąć na stare grafiki. Zalecana jest dezaktywacja zamiast usuwania.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń trwale',
          style: 'destructive',
          onPress: async () => {
            await employeeService.deleteEmployee(employee.id);
            await handleSaved();
          },
        },
      ]
    );
  }

  const visibleEmployees = showInactive ? employees : employees.filter((employee) => employee.isActive);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <SectionTitle>Pracownicy</SectionTitle>
        <Pressable onPress={() => setIsCreating(true)} style={styles.addButton}>
          <Ionicons name="person-add-outline" size={17} color="#ffffff" />
          <Text style={styles.addText}>Dodaj</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => setShowInactive((value) => !value)} style={styles.toggleInactive}>
        <Ionicons name={showInactive ? 'eye-outline' : 'eye-off-outline'} size={18} color={liderColors.blue} />
        <Text style={styles.toggleText}>{showInactive ? 'Ukryj nieaktywnych' : 'Pokaż nieaktywnych'}</Text>
      </Pressable>

      {isCreating || editedEmployee ? (
        <EmployeeEditScreen
          employee={editedEmployee}
          onCancel={() => {
            setEditedEmployee(null);
            setIsCreating(false);
          }}
          onSaved={handleSaved}
        />
      ) : null}

      {isLoading ? (
        <Card style={styles.stateCard}>
          <ActivityIndicator color={liderColors.blue} />
        </Card>
      ) : visibleEmployees.length === 0 ? (
        <Card style={styles.stateCard}>
          <Text style={styles.stateText}>Brak pracowników do pokazania.</Text>
        </Card>
      ) : (
        <View style={styles.list}>
          {visibleEmployees.map((employee) => (
            <Card key={employee.id} style={styles.employeeRow}>
              <View style={styles.employeeInfo}>
                <Text style={styles.employeeName}>{employee.fullName}</Text>
                <Text style={[styles.employeeStatus, employee.isActive ? styles.active : styles.inactive]}>
                  {employee.isActive ? 'Aktywny' : 'Nieaktywny'}
                </Text>
              </View>
              <View style={styles.rowActions}>
                <Pressable onPress={() => setEditedEmployee(employee)} style={styles.iconButton}>
                  <Ionicons name="create-outline" size={18} color={liderColors.blue} />
                </Pressable>
                {employee.isActive ? (
                  <Pressable onPress={() => deactivate(employee)} style={styles.iconButton}>
                    <Ionicons name="pause-circle-outline" size={18} color={liderColors.amber} />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={async () => {
                      await employeeService.reactivateEmployee(employee.id);
                      await handleSaved();
                    }}
                    style={styles.iconButton}>
                    <Ionicons name="play-circle-outline" size={18} color={liderColors.green} />
                  </Pressable>
                )}
                <Pressable onPress={() => deleteEmployee(employee)} style={styles.iconButton}>
                  <Ionicons name="trash-outline" size={18} color={liderColors.red} />
                </Pressable>
              </View>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addButton: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    backgroundColor: liderColors.blue,
    paddingHorizontal: 10,
  },
  addText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  toggleInactive: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
  },
  toggleText: {
    color: liderColors.blue,
    fontSize: 12,
    fontWeight: '900',
  },
  list: {
    gap: 8,
  },
  employeeRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: 12,
  },
  employeeInfo: {
    flex: 1,
    gap: 4,
  },
  employeeName: {
    color: liderColors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  employeeStatus: {
    fontSize: 11,
    fontWeight: '800',
  },
  active: {
    color: liderColors.green,
  },
  inactive: {
    color: liderColors.muted,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
  },
  stateCard: {
    minHeight: 90,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  stateText: {
    color: liderColors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
});
