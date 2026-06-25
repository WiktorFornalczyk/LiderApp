import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Pill, liderColors, SectionTitle } from '@/components/lider-ui';
import * as calendarService from '../services/calendarService';
import { CalendarEvent } from '../types/calendarTypes';
import { formatCalendarDate, formatCalendarDateTime, formatEventTime } from '../utils/calendarFormatUtils';

export function CalendarEventDetailsScreen({ id }: { id: string }) {
  const router = useRouter();
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvent = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const nextEvent = await calendarService.getEventById(id);
      setEvent(nextEvent);
      if (!nextEvent) {
        setError('Nie znaleziono wydarzenia.');
      }
    } catch {
      setError('Nie udało się wczytać wydarzeń.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadEvent();
    }, [loadEvent])
  );

  function deleteEvent() {
    if (!event) {
      return;
    }

    Alert.alert('Czy na pewno chcesz usunąć to wydarzenie?', undefined, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          try {
            await calendarService.deleteEvent(event.id);
            Alert.alert('Usunięto wydarzenie.');
            router.replace('/calendar' as never);
          } catch {
            Alert.alert('Nie udało się usunąć wydarzenia.');
          }
        },
      },
    ]);
  }

  if (isLoading) {
    return <StateCard message="Wczytywanie wydarzenia..." loading />;
  }

  if (error || !event) {
    return <StateCard message={error ?? 'Nie znaleziono wydarzenia.'} />;
  }

  return (
    <View style={styles.wrap}>
      <SectionTitle>Szczegóły wydarzenia</SectionTitle>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{event.title}</Text>
          <Pill label={event.eventType} tone="blue" />
        </View>
        <Detail label="Data" value={formatCalendarDate(event.eventDate)} />
        <Detail label="Godzina" value={formatEventTime(event)} />
        {event.description ? <Detail label="Opis" value={event.description} /> : null}
        <Detail label="Utworzono" value={formatCalendarDateTime(event.createdAt)} />
        <Detail label="Ostatnia edycja" value={formatCalendarDateTime(event.updatedAt)} />
      </Card>
      <View style={styles.actions}>
        <Pressable onPress={() => router.push(`/calendar/${event.id}/edit` as never)} style={styles.primaryButton}>
          <Text style={styles.primaryText}>Edytuj</Text>
        </Pressable>
        <Pressable onPress={deleteEvent} style={styles.deleteButton}>
          <Text style={styles.deleteText}>Usuń</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
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
    gap: 12,
  },
  card: {
    gap: 12,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  title: {
    flex: 1,
    color: liderColors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  detail: {
    gap: 4,
  },
  detailLabel: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  detailValue: {
    color: liderColors.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: liderColors.blue,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  deleteButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: liderColors.red,
    borderRadius: 8,
    paddingHorizontal: 18,
  },
  deleteText: {
    color: liderColors.red,
    fontSize: 13,
    fontWeight: '900',
  },
  stateCard: {
    minHeight: 140,
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
