import { useRouter } from 'expo-router';

import { AppScreen } from '@/components/lider-ui';
import { CalendarEventListScreen } from '@/src/features/calendar/screens/CalendarEventListScreen';

export default function CalendarListRoute() {
  const router = useRouter();

  return (
    <AppScreen title="Lista wydarzeń" leftIcon="chevron-back" onLeftPress={() => router.back()}>
      <CalendarEventListScreen />
    </AppScreen>
  );
}
