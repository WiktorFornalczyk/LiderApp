import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Card, EmptySpacer, liderColors, SectionTitle } from '@/components/lider-ui';
import { ScheduleToolbar } from '../components/ScheduleToolbar';
import { ScheduleEditorData, ScheduleWeek, ScheduleWeekInput } from '../types/scheduleTypes';
import { formatDisplayDate } from '../utils/dateRangeUtils';
import { scheduleErrorMessages } from '../validation/scheduleValidation';
import * as scheduleExportService from '../services/scheduleExportService';
import * as scheduleMaintenanceService from '../services/scheduleMaintenanceService';
import * as scheduleService from '../services/scheduleService';
import { EmployeeListScreen } from './EmployeeListScreen';
import { ScheduleEditorScreen } from './ScheduleEditorScreen';

export function ScheduleListScreen() {
  const [range, setRange] = useState<ScheduleWeekInput>(scheduleService.getCurrentWeekRange());
  const [weeks, setWeeks] = useState<ScheduleWeek[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<ScheduleEditorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCleanupAt, setLastCleanupAt] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [mode, setMode] = useState<'schedule' | 'employees'>('schedule');

  const loadWeeks = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const cleanup = await scheduleMaintenanceService.cleanupOldSchedules();
      setLastCleanupAt(cleanup.lastCleanupAt);
      const nextWeeks = await scheduleService.getScheduleWeeks();
      setWeeks(nextWeeks);

      if (!selectedWeekId) {
        const current = await scheduleService.getScheduleWeekByDate();
        setSelectedWeekId(current?.id ?? nextWeeks[0]?.id ?? null);
      }
    } catch {
      setError(scheduleErrorMessages.loadFailed);
    } finally {
      setIsLoading(false);
    }
  }, [selectedWeekId]);

  useFocusEffect(
    useCallback(() => {
      loadWeeks();
    }, [loadWeeks])
  );

  async function handleCreateSchedule() {
    try {
      const week = await scheduleService.createScheduleWeek(range);
      setSelectedWeekId(week.id);
      setMode('schedule');
      await loadWeeks();
      setRefreshToken((value) => value + 1);
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : scheduleErrorMessages.createFailed;

      if (message === scheduleErrorMessages.duplicateRange) {
        Alert.alert('Zakres już istnieje', 'Grafik dla tego zakresu dat już istnieje. Wybierz go z listy lub zmień daty.');
      } else {
        Alert.alert(scheduleErrorMessages.createFailed, message);
      }
    }
  }

  function handleCopyPrevious() {
    if (!selectedWeekId) {
      return;
    }

    Alert.alert(
      'Kopiuj grafik',
      'Obecny grafik zostanie zastąpiony danymi z poprzedniego tygodnia. Czy chcesz kontynuować?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Kopiuj',
          onPress: async () => {
            try {
              await scheduleService.copyPreviousWeekSchedule(selectedWeekId);
              setRefreshToken((value) => value + 1);
            } catch (copyError) {
              Alert.alert(
                scheduleErrorMessages.copyFailed,
                copyError instanceof Error ? copyError.message : undefined
              );
            }
          },
        },
      ]
    );
  }

  function handleClearSchedule() {
    if (!selectedWeekId) {
      return;
    }

    Alert.alert('Wyczyścić grafik?', 'Czy na pewno chcesz wyczyścić grafik dla tego zakresu dat?', [
      { text: 'Anuluj', style: 'cancel' },
      {
          text: 'Wyczyść',
        style: 'destructive',
        onPress: async () => {
          await scheduleService.clearScheduleWeek(selectedWeekId);
          setRefreshToken((value) => value + 1);
        },
      },
    ]);
  }

  function handleDeleteSchedule() {
    if (!selectedWeekId) {
      return;
    }

    Alert.alert(
      'Usunąć grafik?',
      'Czy na pewno chcesz usunąć ten grafik? Tej operacji nie da się cofnąć.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            await scheduleService.deleteScheduleWeek(selectedWeekId);
            setSelectedWeekId(null);
            setSelectedData(null);
            await loadWeeks();
          },
        },
      ]
    );
  }

  async function handleExport() {
    if (!selectedWeekId) {
      return;
    }

    try {
      const result = await scheduleExportService.generateScheduleXlsx(selectedWeekId);
      Alert.alert(
        'Eksport gotowy',
        result.uri
          ? `Plik ${result.fileName} zapisano: ${result.locationLabel}.`
          : `Wygenerowano plik ${result.fileName}. Udostępnianie plików nie jest dostępne w tym środowisku.`
      );
    } catch {
      Alert.alert(scheduleErrorMessages.exportFailed);
    }
  }

  function setCurrentWeek() {
    setRange(scheduleService.getCurrentWeekRange());
  }

  function moveRange(direction: 'previous' | 'next') {
    setRange((value) =>
      direction === 'previous' ? scheduleService.getPreviousRange(value) : scheduleService.getNextRange(value)
    );
  }

  return (
    <AppScreen title="Grafik" onLeftPress={mode === 'employees' ? () => setMode('schedule') : undefined} wide>
      <View style={styles.modeTabs}>
        <ModeTab label="Grafik" selected={mode === 'schedule'} onPress={() => setMode('schedule')} />
        <ModeTab label="Pracownicy" selected={mode === 'employees'} onPress={() => setMode('employees')} />
      </View>

      {mode === 'employees' ? (
        <EmployeeListScreen
          onChanged={() => {
            setRefreshToken((value) => value + 1);
            loadWeeks();
          }}
        />
      ) : (
        <>
          <ScheduleToolbar
            canUseScheduleActions={Boolean(selectedWeekId)}
            range={range}
            onClear={handleClearSchedule}
            onCopyPrevious={handleCopyPrevious}
            onCreate={handleCreateSchedule}
            onCurrentWeek={setCurrentWeek}
            onDelete={handleDeleteSchedule}
            onExport={handleExport}
            onNextWeek={() => moveRange('next')}
            onPreviousWeek={() => moveRange('previous')}
            onRangeChange={setRange}
          />

          <EmptySpacer height={16} />

          {lastCleanupAt ? (
            <Text style={styles.cleanupText}>Ostatnie czyszczenie starych grafików: {formatDisplayDate(lastCleanupAt.slice(0, 10))}</Text>
          ) : null}

          <EmptySpacer height={12} />
          <SectionTitle>Dostępne grafiki</SectionTitle>

          {isLoading ? (
            <Card style={styles.stateCard}>
              <ActivityIndicator color={liderColors.blue} />
              <Text style={styles.stateText}>Wczytywanie grafików...</Text>
            </Card>
          ) : error ? (
            <Card style={styles.stateCard}>
              <Text style={styles.stateText}>{error}</Text>
            </Card>
          ) : weeks.length === 0 ? (
            <Card style={styles.stateCard}>
              <Ionicons name="calendar-clear-outline" size={28} color={liderColors.muted} />
              <Text style={styles.stateText}>Brak grafików. Wybierz zakres dat i utwórz pierwszy grafik.</Text>
            </Card>
          ) : (
            <View style={styles.weekList}>
              {weeks.map((week) => (
                <Pressable
                  key={week.id}
                  onPress={() => {
                    setSelectedWeekId(week.id);
                    setRange({ startDate: week.startDate, endDate: week.endDate });
                  }}
                  style={[styles.weekButton, selectedWeekId === week.id && styles.weekButtonActive]}>
                  <Text style={styles.weekButtonText}>
                    {formatDisplayDate(week.startDate)} - {formatDisplayDate(week.endDate)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <EmptySpacer height={16} />
          <ScheduleEditorScreen
            refreshToken={refreshToken}
            scheduleWeekId={selectedWeekId}
            onLoaded={setSelectedData}
          />

          {selectedData ? (
            <Text style={styles.footerHint}>
              Każdy wpis zapisuje konkretną datę `entryDate`, więc raporty godzinowe nie pomylą tygodni.
            </Text>
          ) : null}
        </>
      )}
    </AppScreen>
  );
}

function ModeTab({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.modeTab, selected && styles.modeTabSelected]}>
      <Text style={[styles.modeTabText, selected && styles.modeTabTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modeTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  modeTab: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surface,
  },
  modeTabSelected: {
    borderColor: liderColors.blue,
    backgroundColor: 'rgba(45, 124, 255, 0.16)',
  },
  modeTabText: {
    color: liderColors.muted,
    fontSize: 13,
    fontWeight: '900',
  },
  modeTabTextSelected: {
    color: liderColors.blue,
  },
  cleanupText: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  stateCard: {
    minHeight: 118,
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
  weekList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weekButton: {
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surface,
    paddingHorizontal: 10,
  },
  weekButtonActive: {
    borderColor: liderColors.blue,
    backgroundColor: 'rgba(45, 124, 255, 0.16)',
  },
  weekButtonText: {
    color: liderColors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  footerHint: {
    marginTop: 12,
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
});



