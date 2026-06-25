import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { Card, EmptySpacer, liderColors, SectionTitle } from '@/components/lider-ui';
import { ScheduleLegend } from '../components/ScheduleLegend';
import { ScheduleTable } from '../components/ScheduleTable';
import { ShiftPickerModal } from '../components/ShiftPickerModal';
import { ScheduleEditorData, ScheduleEntryWithEmployee, ShiftCode } from '../types/scheduleTypes';
import { formatDisplayDate } from '../utils/dateRangeUtils';
import { getShiftDescription, getShiftHours, getShiftLabel, getShiftNumber } from '../utils/shiftUtils';
import { scheduleErrorMessages } from '../validation/scheduleValidation';
import * as scheduleService from '../services/scheduleService';

export function ScheduleEditorScreen({
  scheduleWeekId,
  refreshToken,
  onLoaded,
}: {
  scheduleWeekId: string | null;
  refreshToken?: number;
  onLoaded?: (data: ScheduleEditorData) => void;
}) {
  const [data, setData] = useState<ScheduleEditorData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<ScheduleEntryWithEmployee | null>(null);
  const [updatingEntryId, setUpdatingEntryId] = useState<string | null>(null);

  const loadSchedule = useCallback(async () => {
    if (!scheduleWeekId) {
      setData(null);
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      const nextData = await scheduleService.getScheduleEditorData(scheduleWeekId);
      setData(nextData);
      onLoaded?.(nextData);
    } catch {
      setError(scheduleErrorMessages.loadFailed);
    } finally {
      setIsLoading(false);
    }
  }, [onLoaded, scheduleWeekId]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule, refreshToken]);

  async function handleSelectShift(shiftCode: ShiftCode) {
    if (!selectedEntry) {
      return;
    }

    try {
      const entry = selectedEntry;
      setUpdatingEntryId(entry.id);
      setSelectedEntry(null);
      await scheduleService.updateScheduleEntry(entry.id, shiftCode);
      setData((currentData) => {
        if (!currentData) {
          return currentData;
        }

        const updatedAt = new Date().toISOString();
        const nextData = {
          ...currentData,
          entries: currentData.entries.map((item) =>
            item.id === entry.id
              ? {
                  ...item,
                  shiftCode,
                  shiftLabel: getShiftLabel(shiftCode),
                  shiftNumber: getShiftNumber(shiftCode),
                  hours: getShiftHours(shiftCode),
                  updatedAt,
                }
              : item
          ),
          week: {
            ...currentData.week,
            updatedAt,
          },
        };

        onLoaded?.(nextData);
        return nextData;
      });
    } catch {
      setError(scheduleErrorMessages.updateFailed);
    } finally {
      setUpdatingEntryId(null);
    }
  }

  function handleClearDay(entryDate: string) {
    if (!data) {
      return;
    }

    Alert.alert('Wyczyść dzień', `Ustawić wszystkie wpisy z ${formatDisplayDate(entryDate)} na 0?`, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Wyczyść',
        style: 'destructive',
        onPress: async () => {
          await scheduleService.clearScheduleDay(data.week.id, entryDate);
          await loadSchedule();
        },
      },
    ]);
  }

  function handleClearEmployee(employeeId: string) {
    if (!data) {
      return;
    }

    Alert.alert('Wyczyść pracownika', 'Ustawić wszystkie dni tego pracownika na 0?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Wyczyść',
        style: 'destructive',
        onPress: async () => {
          await scheduleService.clearEmployeeSchedule(data.week.id, employeeId);
          await loadSchedule();
        },
      },
    ]);
  }

  if (!scheduleWeekId) {
    return (
      <Card style={styles.stateCard}>
        <Text style={styles.stateText}>Utwórz albo wybierz grafik, aby rozpocząć planowanie.</Text>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card style={styles.stateCard}>
        <ActivityIndicator color={liderColors.blue} />
        <Text style={styles.stateText}>Wczytywanie grafiku...</Text>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card style={styles.stateCard}>
        <Text style={styles.stateText}>{error ?? scheduleErrorMessages.loadFailed}</Text>
      </Card>
    );
  }

  return (
    <View>
      <SectionTitle>
        {formatDisplayDate(data.week.startDate)} - {formatDisplayDate(data.week.endDate)}
      </SectionTitle>
      <ScheduleTable
        dates={data.dates}
        entries={data.entries}
        updatingEntryId={updatingEntryId}
        onClearDay={handleClearDay}
        onClearEmployee={handleClearEmployee}
        onSelectEntry={setSelectedEntry}
      />

      <EmptySpacer height={16} />
      <SectionTitle>Legenda</SectionTitle>
      <ScheduleLegend />

      <ShiftPickerModal
        currentShiftCode={selectedEntry?.shiftCode}
        title={
          selectedEntry
            ? `${selectedEntry.employee.fullName}, ${formatDisplayDate(selectedEntry.entryDate)}`
            : undefined
        }
        visible={Boolean(selectedEntry)}
        onClose={() => setSelectedEntry(null)}
        onSelect={handleSelectShift}
      />

      {selectedEntry ? (
        <Text style={styles.hiddenDescription}>{getShiftDescription(selectedEntry.shiftCode)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stateCard: {
    minHeight: 128,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
  },
  stateText: {
    color: liderColors.muted,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 19,
  },
  hiddenDescription: {
    width: 1,
    height: 1,
    opacity: 0,
  },
});
