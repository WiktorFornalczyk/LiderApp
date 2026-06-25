import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppScreen } from '@/components/lider-ui';
import { CalendarEventDetailsScreen } from '@/src/features/calendar/screens/CalendarEventDetailsScreen';

export default function CalendarEventDetailsRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();

  return (
    <AppScreen title="Wydarzenie" leftIcon="chevron-back" onLeftPress={() => router.back()}>
      <CalendarEventDetailsScreen id={params.id} />
    </AppScreen>
  );
}
