import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppScreen } from '@/components/lider-ui';
import { CalendarEventEditScreen } from '@/src/features/calendar/screens/CalendarEventEditScreen';

export default function NewCalendarEventRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();

  return (
    <AppScreen title="Dodaj wydarzenie" leftIcon="chevron-back" onLeftPress={() => router.back()}>
      <CalendarEventEditScreen initialDate={params.date ?? null} />
    </AppScreen>
  );
}
