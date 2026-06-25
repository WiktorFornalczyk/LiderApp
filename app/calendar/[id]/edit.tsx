import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';

import { AppScreen, Card, liderColors } from '@/components/lider-ui';
import { CalendarEventEditScreen } from '@/src/features/calendar/screens/CalendarEventEditScreen';
import * as calendarService from '@/src/features/calendar/services/calendarService';
import { CalendarEvent } from '@/src/features/calendar/types/calendarTypes';

export default function CalendarEventEditRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadEvent() {
        setIsLoading(true);
        const nextEvent = await calendarService.getEventById(params.id);

        if (isActive) {
          setEvent(nextEvent);
          setIsLoading(false);
        }
      }

      loadEvent();

      return () => {
        isActive = false;
      };
    }, [params.id])
  );

  return (
    <AppScreen title="Edytuj wydarzenie" leftIcon="chevron-back" onLeftPress={() => router.back()}>
      {isLoading ? (
        <Card style={{ minHeight: 140, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16 }}>
          <ActivityIndicator color={liderColors.blue} />
          <Text style={{ color: liderColors.muted, fontWeight: '800' }}>Wczytywanie wydarzenia...</Text>
        </Card>
      ) : event ? (
        <CalendarEventEditScreen event={event} />
      ) : (
        <Card style={{ minHeight: 140, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Text style={{ color: liderColors.muted, fontWeight: '800', textAlign: 'center' }}>Nie znaleziono wydarzenia.</Text>
        </Card>
      )}
    </AppScreen>
  );
}
