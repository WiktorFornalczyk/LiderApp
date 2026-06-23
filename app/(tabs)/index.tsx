import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AppScreen,
  Card,
  EmptySpacer,
  liderColors,
  LiderIconName,
  SectionTitle,
} from '@/components/lider-ui';

const quickActions: {
  label: string;
  icon: LiderIconName;
  color: string;
  route?: '/(tabs)/notatki' | '/notes/new';
}[] = [
  { label: 'Place', icon: 'cash-outline', color: liderColors.blue },
  { label: 'Dodaj BB', icon: 'add-circle-outline', color: liderColors.green },
  { label: 'Grafik', icon: 'calendar-outline', color: '#a778ff' },
  { label: 'Notatnik', icon: 'reader-outline', color: liderColors.amber, route: '/(tabs)/notatki' },
  { label: 'Nowa notatka', icon: 'create-outline', color: liderColors.violet, route: '/notes/new' },
];

const recentBb = [
  { batch: '20240517', details: 'BB 001-025 • L-I • Plac Główny', time: 'Dzisiaj, 08:15', color: liderColors.amber },
  { batch: '20240516', details: 'BB 101-125 • L-II • Plac 2', time: 'Wczoraj, 16:40', color: '#ff8a3d' },
];

const events = [
  { title: 'Przegląd linii L-I', time: 'Dzisiaj, 14:00', color: liderColors.blue },
  { title: 'Spotkanie BHP', time: 'Jutro, 08:00', color: liderColors.green },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <AppScreen title="LiderApp" subtitle="Rafineria Jasło - Sadza" rightIcon="notifications-outline">
      <SectionTitle>Szybkie akcje</SectionTitle>
      <View style={styles.quickGrid}>
        {quickActions.map((action) => (
          <Pressable
            key={action.label}
            onPress={() => {
              if (action.route) {
                router.push(action.route);
              }
            }}
            style={styles.quickCard}>
            <Ionicons name={action.icon} size={28} color={action.color} />
            <Text style={styles.quickLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <EmptySpacer height={18} />

      <SectionTitle>Podsumowanie</SectionTitle>
      <View style={styles.summaryGrid}>
        <MetricCard label="Aktywne BB" value="128" color={liderColors.blue} />
        <MetricCard label="Zarchiwizowane BB" value="16" color={liderColors.amber} />
      </View>

      <EmptySpacer height={18} />

      <SectionTitle>Ostatnio dodane BB</SectionTitle>
      <Card>
        {recentBb.map((item, index) => (
          <View key={item.batch} style={[styles.listRow, index > 0 && styles.rowBorder]}>
            <View style={[styles.marker, { backgroundColor: item.color }]} />
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>Partia: {item.batch}</Text>
              <Text style={styles.rowSub}>{item.details}</Text>
            </View>
            <Text style={styles.rowTime}>{item.time}</Text>
          </View>
        ))}
      </Card>

      <EmptySpacer height={18} />

      <SectionTitle>Najbliższe wydarzenia</SectionTitle>
      <Card>
        {events.map((event, index) => (
          <View key={event.title} style={[styles.listRow, index > 0 && styles.rowBorder]}>
            <View style={[styles.marker, { backgroundColor: event.color }]} />
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{event.title}</Text>
            </View>
            <Text style={styles.rowTime}>{event.time}</Text>
          </View>
        ))}
      </Card>
    </AppScreen>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card style={styles.metricCard}>
      <Text style={[styles.metricLabel, { color }]}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </Card>
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
    gap: 10,
  },
  metricCard: {
    flex: 1,
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
  },
  rowTime: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
});
