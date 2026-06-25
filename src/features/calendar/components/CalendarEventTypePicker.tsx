import { Pressable, StyleSheet, Text, View } from 'react-native';

import { liderColors } from '@/components/lider-ui';
import { CalendarEventType, calendarEventTypes } from '../types/calendarTypes';

export function CalendarEventTypePicker({
  value,
  onChange,
}: {
  value: CalendarEventType | null | undefined;
  onChange: (value: CalendarEventType) => void;
}) {
  return (
    <View style={styles.wrap}>
      {calendarEventTypes.map((type) => {
        const selected = (value ?? 'Inne') === type;
        return (
          <Pressable key={type} onPress={() => onChange(type)} style={[styles.chip, selected && styles.chipActive]}>
            <Text style={[styles.chipText, selected && styles.chipTextActive]}>{type}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 36,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    paddingHorizontal: 10,
  },
  chipActive: {
    borderColor: liderColors.blue,
    backgroundColor: 'rgba(45, 124, 255, 0.16)',
  },
  chipText: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  chipTextActive: {
    color: liderColors.blue,
  },
});
