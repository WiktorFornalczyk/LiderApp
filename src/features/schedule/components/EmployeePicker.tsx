import { Pressable, StyleSheet, Text, View } from 'react-native';

import { liderColors } from '@/components/lider-ui';
import { Employee } from '../types/employeeTypes';

export function EmployeePicker({
  employees,
  selectedEmployeeId,
  onSelect,
}: {
  employees: Employee[];
  selectedEmployeeId?: string | null;
  onSelect: (employeeId: string | null) => void;
}) {
  return (
    <View style={styles.wrap}>
      <Chip selected={!selectedEmployeeId} label="Wszyscy" onPress={() => onSelect(null)} />
      {employees.map((employee) => (
        <Chip
          key={employee.id}
          selected={selectedEmployeeId === employee.id}
          label={employee.fullName}
          onPress={() => onSelect(employee.id)}
        />
      ))}
    </View>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 36,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surface,
    paddingHorizontal: 10,
  },
  chipSelected: {
    borderColor: liderColors.blue,
    backgroundColor: 'rgba(45, 124, 255, 0.16)',
  },
  chipText: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  chipTextSelected: {
    color: liderColors.blue,
  },
});
