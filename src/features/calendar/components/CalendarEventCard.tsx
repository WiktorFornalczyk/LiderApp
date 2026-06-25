import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Pill, liderColors } from '@/components/lider-ui';
import { CalendarEvent } from '../types/calendarTypes';
import { formatCalendarDate, formatEventTime } from '../utils/calendarFormatUtils';

export function CalendarEventCard({ event, onPress }: { event: CalendarEvent; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{event.title}</Text>
          <Pill label={event.eventType} tone={getTone(event.eventType)} />
        </View>
        <Text style={styles.meta}>
          {formatCalendarDate(event.eventDate)} · {formatEventTime(event)}
        </Text>
        {event.description ? <Text numberOfLines={2} style={styles.description}>{event.description}</Text> : null}
      </Card>
    </Pressable>
  );
}

function getTone(type: CalendarEvent['eventType']) {
  if (type === 'BB') return 'amber';
  if (type === 'Urlop') return 'green';
  if (type === 'Przypomnienie') return 'red';
  if (type === 'Raport') return 'blue';
  return 'neutral';
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  title: {
    flex: 1,
    color: liderColors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  meta: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  description: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
});
