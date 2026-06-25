import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AppScreen,
  Card,
  EmptySpacer,
  liderColors,
  LiderIconName,
  SectionTitle,
} from '@/components/lider-ui';
import * as bbService from '@/src/features/bb/services/bbService';
import { BbRecordWithYard } from '@/src/features/bb/types/bbTypes';
import { formatDateTime } from '@/src/features/bb/utils/bbFormatUtils';
import { formatBbRange } from '@/src/features/bb/utils/bbRangeUtils';
import * as calendarService from '@/src/features/calendar/services/calendarService';
import { CalendarEvent } from '@/src/features/calendar/types/calendarTypes';
import { formatCalendarDate, formatEventTime } from '@/src/features/calendar/utils/calendarFormatUtils';

const quickActions: {
  label: string;
  icon: LiderIconName;
  color: string;
  route: string;
}[] = [
  { label: 'Dodaj BB', icon: 'add-circle-outline', color: liderColors.green, route: '/bb/new' },
  { label: 'Dodaj wydarzenie', icon: 'today-outline', color: liderColors.blue, route: '/calendar/new' },
  { label: 'Nowy grafik', icon: 'calendar-outline', color: '#a778ff', route: '/(tabs)/grafik' },
  { label: 'Nowa notatka', icon: 'create-outline', color: liderColors.violet, route: '/notes/new' },
  { label: 'Nowy raport', icon: 'reader-outline', color: liderColors.amber, route: '/reports/new' },
];

type DashboardData = {
  counts: {
    active: number;
    archived: number;
    yards: number;
  };
  recentBb: BbRecordWithYard[];
  calendar: {
    todayEvents: CalendarEvent[];
    upcomingEvents: CalendarEvent[];
    todayCount: number;
    nextEvent: CalendarEvent | null;
  };
};

export default function HomeScreen() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const [bbSummary, calendarSummary] = await Promise.all([
        bbService.getDashboardBbSummary(),
        calendarService.getDashboardCalendarSummary(),
      ]);

      setData({
        counts: bbSummary.counts,
        recentBb: bbSummary.recent,
        calendar: calendarSummary,
      });
    } catch {
      setError('Nie udało się wczytać danych dashboardu.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  return (
    <AppScreen title="LiderApp" rightIcon="notifications-outline">
      <SectionTitle>Szybkie akcje</SectionTitle>
      <View style={styles.quickGrid}>
        {quickActions.map((action) => (
          <Pressable
            key={action.label}
            onPress={() => router.push(action.route as never)}
            style={styles.quickCard}>
            <Ionicons name={action.icon} size={28} color={action.color} />
            <Text style={styles.quickLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <EmptySpacer height={18} />

      {isLoading ? (
        <StateCard message="Wczytywanie dashboardu..." loading />
      ) : error ? (
        <StateCard message={error} />
      ) : data ? (
        <>
          <SectionTitle>Podsumowanie</SectionTitle>
          <View style={styles.summaryGrid}>
            <MetricCard label="Aktywne BB" value={String(data.counts.active)} color={liderColors.blue} />
            <MetricCard label="Archiwum BB" value={String(data.counts.archived)} color={liderColors.amber} />
          </View>

          <EmptySpacer height={18} />

          <SectionTitle>Ostatnio dodane BB</SectionTitle>
          <Card>
            {data.recentBb.length === 0 ? (
              <EmptyRow title="Brak zapisów BB." />
            ) : (
              data.recentBb.map((item, index) => (
                <Pressable
                  key={item.id}
                  onPress={() => router.push('/(tabs)/bb' as never)}
                  style={[styles.listRow, index > 0 && styles.rowBorder]}>
                  <View style={[styles.marker, { backgroundColor: item.linia === 'L-I' ? liderColors.amber : liderColors.blue }]} />
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>Partia: {item.nrPartii}</Text>
                    <Text style={styles.rowSub}>
                      {formatBbRange(item.bbOd, item.bbDo)} · {item.linia} · {item.yard.name} · {item.rodzajSadzy}
                    </Text>
                  </View>
                  <Text style={styles.rowTime}>{formatDateTime(item.createdAt)}</Text>
                </Pressable>
              ))
            )}
          </Card>

          <EmptySpacer height={18} />

          <SectionTitle>Najbliższe wydarzenia</SectionTitle>
          <Card>
            {data.calendar.upcomingEvents.length === 0 ? (
              <Pressable onPress={() => router.push('/calendar/new' as never)} style={styles.emptyRow}>
                <Text style={styles.stateText}>Brak wydarzeń. Dodaj pierwsze wydarzenie.</Text>
              </Pressable>
            ) : (
              data.calendar.upcomingEvents.map((event, index) => (
              <Pressable
                key={event.id}
                onPress={() => router.push(`/calendar/${event.id}` as never)}
                style={[styles.listRow, index > 0 && styles.rowBorder]}>
                <View style={[styles.marker, { backgroundColor: getCalendarEventColor(event.eventType) }]} />
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>{event.title}</Text>
                  <Text style={styles.rowSub}>
                    {formatCalendarDate(event.eventDate)} Â· {formatEventTime(event)} Â· {event.eventType}
                  </Text>
                </View>
                <Text style={styles.rowTime}>{event.eventDate}</Text>
              </Pressable>
              ))
            )}
          </Card>

        </>
      ) : null}
    </AppScreen>
  );
}

function getCalendarEventColor(type: CalendarEvent['eventType']) {
  if (type === 'BB') return liderColors.amber;
  if (type === 'Urlop') return liderColors.green;
  if (type === 'Przypomnienie') return liderColors.red;
  if (type === 'Raport') return liderColors.blue;
  return liderColors.violet;
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card style={styles.metricCard}>
      <Text style={[styles.metricLabel, { color }]}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </Card>
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

function EmptyRow({ title }: { title: string }) {
  return (
    <View style={styles.emptyRow}>
      <Text style={styles.stateText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickCard: {
    width: '30.5%',
    minWidth: 96,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surface,
  },
  quickLabel: {
    color: liderColors.text,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minWidth: 128,
    minHeight: 82,
    justifyContent: 'center',
    padding: 14,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  metricValue: {
    marginTop: 8,
    fontSize: 29,
    fontWeight: '900',
  },
  listRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: liderColors.borderSoft,
  },
  marker: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rowBody: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    color: liderColors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  rowSub: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  rowTime: {
    maxWidth: 94,
    color: liderColors.muted,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'right',
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
    lineHeight: 18,
  },
  emptyRow: {
    minHeight: 82,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});

