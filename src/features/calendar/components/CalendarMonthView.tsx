import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, liderColors } from '@/components/lider-ui';
import { addMonths, getCalendarGridDays, getTodayDate } from '../utils/calendarDateUtils';
import { formatCalendarMonth } from '../utils/calendarFormatUtils';
import { CalendarDayCell } from './CalendarDayCell';

const weekDays = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

export function CalendarMonthView({
  monthDate,
  selectedDate,
  eventDates,
  onMonthChange,
  onDateSelect,
}: {
  monthDate: string;
  selectedDate: string;
  eventDates: Set<string>;
  onMonthChange: (date: string) => void;
  onDateSelect: (date: string) => void;
}) {
  const today = getTodayDate();
  const days = getCalendarGridDays(monthDate);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Pressable onPress={() => onMonthChange(addMonths(monthDate, -1))} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={20} color={liderColors.text} />
        </Pressable>
        <Text style={styles.monthTitle}>{formatCalendarMonth(monthDate)}</Text>
        <Pressable onPress={() => onMonthChange(addMonths(monthDate, 1))} style={styles.iconButton}>
          <Ionicons name="chevron-forward" size={20} color={liderColors.text} />
        </Pressable>
      </View>
      <Pressable onPress={() => onMonthChange(today)} style={styles.todayButton}>
        <Text style={styles.todayText}>Dzisiaj</Text>
      </Pressable>
      <View style={styles.weekRow}>
        {weekDays.map((day) => (
          <Text key={day} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {days.map((day) => (
          <CalendarDayCell
            dayNumber={day.dayNumber}
            hasEvents={eventDates.has(day.date)}
            isCurrentMonth={day.isCurrentMonth}
            isSelected={day.date === selectedDate}
            isToday={day.date === today}
            key={day.date}
            onPress={() => onDateSelect(day.date)}
          />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 12,
  },
  header: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
  },
  monthTitle: {
    color: liderColors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  todayButton: {
    alignSelf: 'center',
    minHeight: 34,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  todayText: {
    color: liderColors.blue,
    fontSize: 12,
    fontWeight: '900',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekDay: {
    width: `${100 / 7}%`,
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
