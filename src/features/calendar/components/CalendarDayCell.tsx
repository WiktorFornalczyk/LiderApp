import { Pressable, StyleSheet, Text, View } from 'react-native';

import { liderColors } from '@/components/lider-ui';

export function CalendarDayCell({
  dayNumber,
  isCurrentMonth,
  isToday,
  isSelected,
  hasEvents,
  onPress,
}: {
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasEvents: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.cell,
        !isCurrentMonth && styles.outsideMonth,
        isToday && styles.today,
        isSelected && styles.selected,
      ]}>
      <Text style={[styles.dayText, !isCurrentMonth && styles.mutedText, isSelected && styles.selectedText]}>{dayNumber}</Text>
      <View style={[styles.dot, hasEvents && styles.dotActive]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 8,
  },
  outsideMonth: {
    opacity: 0.42,
  },
  today: {
    borderWidth: 1,
    borderColor: liderColors.amber,
  },
  selected: {
    backgroundColor: liderColors.blue,
  },
  dayText: {
    color: liderColors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  mutedText: {
    color: liderColors.dim,
  },
  selectedText: {
    color: '#ffffff',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  dotActive: {
    backgroundColor: liderColors.green,
  },
});
