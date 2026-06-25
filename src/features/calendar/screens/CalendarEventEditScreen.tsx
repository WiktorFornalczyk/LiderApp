import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { CalendarEventForm } from '../components/CalendarEventForm';
import * as calendarService from '../services/calendarService';
import { CalendarEvent, CalendarEventInput } from '../types/calendarTypes';
import { getTodayDate } from '../utils/calendarDateUtils';

export function CalendarEventEditScreen({
  event,
  initialDate,
}: {
  event?: CalendarEvent | null;
  initialDate?: string | null;
}) {
  const router = useRouter();
  const navigation = useNavigation();
  const [input, setInput] = useState<CalendarEventInput>(() =>
    event
      ? {
          title: event.title,
          description: event.description,
          eventDate: event.eventDate,
          eventTime: event.eventTime,
          eventType: event.eventType,
          isAllDay: event.isAllDay,
        }
      : {
          title: '',
          description: '',
          eventDate: initialDate || getTodayDate(),
          eventTime: '',
          eventType: 'Inne',
          isAllDay: true,
        }
  );
  const errors = calendarService.validateEvent(input);
  const initialSnapshot = useRef(JSON.stringify(input));
  const hasUnsavedChanges = event ? JSON.stringify(input) !== initialSnapshot.current : Boolean(input.title.trim() || input.description?.trim());

  useEffect(() => {
    if (!event) {
      return;
    }

    const unsubscribe = navigation.addListener('beforeRemove', (navEvent) => {
      if (!hasUnsavedChanges) {
        return;
      }

      navEvent.preventDefault();
      Alert.alert('Masz niezapisane zmiany.', 'Czy chcesz wyjść bez zapisywania?', [
        { text: 'Zostań', style: 'cancel' },
        {
          text: 'Wyjdź',
          style: 'destructive',
          onPress: () => navigation.dispatch(navEvent.data.action),
        },
      ]);
    });

    return unsubscribe;
  }, [event, hasUnsavedChanges, navigation]);

  async function save() {
    try {
      const savedEvent = event
        ? await calendarService.updateEvent(event.id, input)
        : await calendarService.createEvent(input);
      Alert.alert('Zapisano wydarzenie.');
      router.replace(`/calendar/${savedEvent?.id ?? event?.id}` as never);
    } catch (error) {
      Alert.alert(error instanceof Error ? error.message : 'Nie udało się zapisać wydarzenia.');
    }
  }

  return <CalendarEventForm errors={errors} input={input} submitLabel={event ? 'Zapisz zmiany' : 'Zapisz'} onChange={setInput} onSubmit={save} />;
}
