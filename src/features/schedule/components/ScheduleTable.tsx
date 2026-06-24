import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { liderColors } from '@/components/lider-ui';
import { ScheduleEntryWithEmployee, ShiftCode } from '../types/scheduleTypes';
import { formatDisplayDate, getDayLabel } from '../utils/dateRangeUtils';
import { ScheduleCell } from './ScheduleCell';

export function ScheduleTable({
  dates,
  entries,
  updatingEntryId,
  onSelectEntry,
  onClearDay,
  onClearEmployee,
}: {
  dates: string[];
  entries: ScheduleEntryWithEmployee[];
  updatingEntryId?: string | null;
  onSelectEntry: (entry: ScheduleEntryWithEmployee) => void;
  onClearDay?: (entryDate: string) => void;
  onClearEmployee?: (employeeId: string) => void;
}) {
  const employees = Array.from(new Map(entries.map((entry) => [entry.employeeId, entry.employee])).values());

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          <View style={[styles.employeeHeader, styles.stickyColumn]}>
            <Text style={styles.headerText}>Pracownik</Text>
          </View>
          {dates.map((date) => (
            <View key={date} style={styles.dayHeader}>
              <Text style={styles.headerText}>{getDayLabel(date)}</Text>
              <Text style={styles.dateText}>{formatDisplayDate(date).slice(0, 5)}</Text>
              {onClearDay ? (
                <Text onPress={() => onClearDay(date)} style={styles.clearAction}>
                  0 dzień
                </Text>
              ) : null}
            </View>
          ))}
        </View>

        {employees.map((employee) => (
          <View key={employee.id} style={styles.row}>
            <View style={[styles.employeeCell, styles.stickyColumn]}>
              <Text numberOfLines={2} style={styles.employeeName}>
                {employee.fullName}
              </Text>
              {onClearEmployee ? (
                <Text onPress={() => onClearEmployee(employee.id)} style={styles.clearAction}>
                  0 tydz.
                </Text>
              ) : null}
            </View>
            {dates.map((date) => {
              const entry = entries.find((item) => item.employeeId === employee.id && item.entryDate === date);

              return (
                <View key={`${employee.id}-${date}`} style={styles.cellWrap}>
                  <ScheduleCell
                    entry={entry}
                    isUpdating={entry?.id === updatingEntryId}
                    onPress={() => {
                      if (entry) {
                        onSelectEntry(entry);
                      }
                    }}
                  />
                </View>
              );
            })}
          </View>
        ))}

        <View style={styles.summaryRow}>
          <View style={[styles.employeeCell, styles.stickyColumn]}>
            <Text style={styles.summaryTitle}>Obsada</Text>
          </View>
          {dates.map((date) => (
            <View key={`summary-${date}`} style={styles.summaryCell}>
              {[1, 2, 3].map((shiftNumber) => {
                const shiftEntries = entries.filter(
                  (entry) => entry.entryDate === date && entry.shiftNumber === shiftNumber && entry.hours > 0
                );
                const hours = shiftEntries.reduce((sum, entry) => sum + entry.hours, 0);

                return (
                  <Text key={shiftNumber} style={styles.summaryText}>
                    Z{shiftNumber}: {shiftEntries.length}/{hours}h
                  </Text>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

export type ScheduleTableSelection = {
  entry: ScheduleEntryWithEmployee;
  shiftCode: ShiftCode;
};

const styles = StyleSheet.create({
  table: {
    minWidth: 420,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: liderColors.surface,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: liderColors.borderSoft,
    backgroundColor: liderColors.surfaceAlt,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: liderColors.borderSoft,
  },
  stickyColumn: {
    backgroundColor: liderColors.surfaceAlt,
  },
  employeeHeader: {
    width: 128,
    minHeight: 66,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  dayHeader: {
    width: 64,
    minHeight: 66,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderLeftWidth: 1,
    borderLeftColor: liderColors.borderSoft,
  },
  headerText: {
    color: liderColors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  dateText: {
    color: liderColors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  clearAction: {
    color: liderColors.blue,
    fontSize: 10,
    fontWeight: '900',
  },
  employeeCell: {
    width: 128,
    minHeight: 54,
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 10,
  },
  employeeName: {
    color: liderColors.text,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  cellWrap: {
    width: 64,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: liderColors.borderSoft,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: liderColors.surfaceSoft,
  },
  summaryCell: {
    width: 64,
    minHeight: 72,
    justifyContent: 'center',
    gap: 3,
    borderLeftWidth: 1,
    borderLeftColor: liderColors.borderSoft,
    paddingHorizontal: 4,
  },
  summaryTitle: {
    color: liderColors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  summaryText: {
    color: liderColors.muted,
    fontSize: 9,
    fontWeight: '800',
  },
});
