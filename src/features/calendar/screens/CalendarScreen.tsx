import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Card, EmptySpacer, liderColors, SectionTitle } from '@/components/lider-ui';
import { CalendarEventCard } from '../components/CalendarEventCard';
import { CalendarMonthView } from '../components/CalendarMonthView';
import * as calendarService from '../services/calendarService';
import { CalendarEvent } from '../types/calendarTypes';
import { getMonthRange, getMonthStart, getTodayDate } from '../utils/calendarDateUtils';
import { formatCalendarDate } from '../utils/calendarFormatUtils';

export function CalendarScreen() {
  const router = useRouter();
  const today = getTodayDate();
  const [monthDate, setMonthDate] = useState(getMonthStart(today));
  const [selectedDate, setSelectedDate] = useState(today);
  const [monthEvents, setMonthEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCalendar = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const range = getMonthRange(monthDate);
      const [nextMonthEvents, nextSelectedEvents] = await Promise.all([
        calendarService.getEventsByDateRange(range.startDate, range.endDate),
        calendarService.getEventsByDate(selectedDate),
      ]);
      setMonthEvents(nextMonthEvents);
      setSelectedEvents(nextSelectedEvents);
    } catch {
      setError('Nie udało się wczytać wydarzeń.');
    } finally {
      setIsLoading(false);
    }
  }, [monthDate, selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadCalendar();
    }, [loadCalendar])
  );

  const eventDates = useMemo(() => new Set(monthEvents.map((event) => event.eventDate)), [monthEvents]);

  function selectDate(date: string) {
    setSelectedDate(date);
    setMonthDate(getMonthStart(date));
  }

  return (
    <AppScreen title="Kalendarz" rightSlot={<HeaderActions onAdd={() => router.push(`/calendar/new?date=${selectedDate}` as never)} onList={() => router.push('/calendar/list' as never)} />}>
      <CalendarMonthView
        eventDates={eventDates}
        monthDate={monthDate}
        selectedDate={selectedDate}
        onDateSelect={selectDate}
        onMonthChange={(date) => setMonthDate(getMonthStart(date))}
      />

      <EmptySpacer height={18} />

      <View style={styles.sectionHeader}>
        <SectionTitle>{formatCalendarDate(selectedDate)}</SectionTitle>
        <Text style={styles.countText}>{selectedEvents.length} wydarzeń</Text>
      </View>
      {isLoading ? (
        <StateCard message="Wczytywanie wydarzeń..." loading />
      ) : error ? (
        <StateCard message={error} />
      ) : selectedEvents.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>Brak wydarzeń. Dodaj pierwsze wydarzenie.</Text>
          <Pressable onPress={() => router.push(`/calendar/new?date=${selectedDate}` as never)} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Dodaj wydarzenie</Text>
          </Pressable>
        </Card>
      ) : (
        <View style={styles.list}>
          {selectedEvents.map((event) => (
            <CalendarEventCard
              event={event}
              key={event.id}
              onPress={() => router.push(`/calendar/${event.id}` as never)}
            />
          ))}
        </View>
      )}
    </AppScreen>
  );
}

function HeaderActions({ onAdd, onList }: { onAdd: () => void; onList: () => void }) {
  return (
    <View style={styles.headerActions}>
      <Pressable onPress={onList} style={styles.headerButton}>
        <Ionicons name="list-outline" size={20} color={liderColors.text} />
      </Pressable>
      <Pressable onPress={onAdd} style={[styles.headerButton, styles.headerButtonAccent]}>
        <Ionicons name="add" size={22} color="#ffffff" />
      </Pressable>
    </View>
  );
}

function StateCard({ message, loading }: { message: string; loading?: boolean }) {
  return (
    <Card style={styles.stateCard}>
      {loading ? <ActivityIndicator color={liderColors.blue} /> : null}
      <Text style={styles.emptyText}>{message}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countText: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  list: {
    gap: 10,
  },
  emptyCard: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
  emptyText: {
    color: liderColors.muted,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 18,
  },
  stateCard: {
    minHeight: 130,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
  },
  primaryButton: {
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: liderColors.blue,
    paddingHorizontal: 14,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
  },
  headerButtonAccent: {
    backgroundColor: liderColors.blue,
  },
});
