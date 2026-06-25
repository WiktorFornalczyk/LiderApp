import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card, EmptySpacer, liderColors, SectionTitle } from '@/components/lider-ui';
import { CalendarEventCard } from '../components/CalendarEventCard';
import { CalendarFilters } from '../components/CalendarFilters';
import * as calendarService from '../services/calendarService';
import { CalendarEvent, CalendarEventType, CalendarFilterMode, CalendarSortMode } from '../types/calendarTypes';

export function CalendarEventListScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<CalendarFilterMode>('upcoming');
  const [eventType, setEventType] = useState<CalendarEventType | null>('Praca');
  const [sortMode, setSortMode] = useState<CalendarSortMode>('upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const nextEvents = await calendarService.getEvents({ mode, eventType, query, sortMode });
      setEvents(nextEvents);
    } catch {
      setError('Nie udało się wczytać wydarzeń.');
    } finally {
      setIsLoading(false);
    }
  }, [eventType, mode, query, sortMode]);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  return (
    <View style={styles.wrap}>
      <SectionTitle>Filtry</SectionTitle>
      <Card style={styles.filtersCard}>
        <CalendarFilters
          eventType={eventType}
          mode={mode}
          query={query}
          sortMode={sortMode}
          onModeChange={setMode}
          onQueryChange={setQuery}
          onSortChange={setSortMode}
          onTypeChange={(type) => {
            setEventType(type);
            setMode('type');
          }}
        />
      </Card>

      <EmptySpacer height={8} />
      <SectionTitle>Lista wydarzeń</SectionTitle>
      {isLoading ? (
        <StateCard message="Wczytywanie wydarzeń..." loading />
      ) : error ? (
        <StateCard message={error} />
      ) : events.length === 0 ? (
        <StateCard message={query ? 'Nie znaleziono wydarzeń.' : 'Brak wydarzeń. Dodaj pierwsze wydarzenie.'} />
      ) : (
        <View style={styles.list}>
          {events.map((event) => (
            <CalendarEventCard
              event={event}
              key={event.id}
              onPress={() => router.push(`/calendar/${event.id}` as never)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function StateCard({ message, loading }: { message: string; loading?: boolean }) {
  return (
    <Card style={styles.stateCard}>
      {loading ? <ActivityIndicator color={liderColors.blue} /> : null}
      <Text style={styles.stateText}>{message}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  filtersCard: {
    padding: 12,
  },
  list: {
    gap: 10,
  },
  stateCard: {
    minHeight: 130,
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
  },
});
