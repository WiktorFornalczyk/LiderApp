import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { liderColors } from '@/components/lider-ui';
import { CalendarEventType, CalendarFilterMode, CalendarSortMode, calendarEventTypes } from '../types/calendarTypes';

const filterOptions: { label: string; value: CalendarFilterMode }[] = [
  { label: 'Wszystkie', value: 'all' },
  { label: 'Nadchodzące', value: 'upcoming' },
  { label: 'Przeszłe', value: 'past' },
  { label: 'Dzisiejsze', value: 'today' },
  { label: 'Typ', value: 'type' },
];

const sortOptions: { label: string; value: CalendarSortMode }[] = [
  { label: 'Najbliższe', value: 'upcoming' },
  { label: 'Najnowsze dodane', value: 'created_desc' },
  { label: 'Najstarsze', value: 'oldest' },
];

export function CalendarFilters({
  query,
  mode,
  eventType,
  sortMode,
  onQueryChange,
  onModeChange,
  onTypeChange,
  onSortChange,
}: {
  query: string;
  mode: CalendarFilterMode;
  eventType: CalendarEventType | null;
  sortMode: CalendarSortMode;
  onQueryChange: (value: string) => void;
  onModeChange: (value: CalendarFilterMode) => void;
  onTypeChange: (value: CalendarEventType) => void;
  onSortChange: (value: CalendarSortMode) => void;
}) {
  return (
    <View style={styles.wrap}>
      <TextInput
        onChangeText={onQueryChange}
        placeholder="Szukaj po tytule, opisie lub typie"
        placeholderTextColor={liderColors.dim}
        style={styles.search}
        value={query}
      />
      <View style={styles.row}>
        {filterOptions.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={mode === option.value}
            onPress={() => onModeChange(option.value)}
          />
        ))}
      </View>
      {mode === 'type' ? (
        <View style={styles.row}>
          {calendarEventTypes.map((type) => (
            <Chip key={type} label={type} selected={eventType === type} onPress={() => onTypeChange(type)} />
          ))}
        </View>
      ) : null}
      <View style={styles.row}>
        {sortOptions.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={sortMode === option.value}
            onPress={() => onSortChange(option.value)}
          />
        ))}
      </View>
    </View>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipActive]}>
      <Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  search: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    color: liderColors.text,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 34,
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
    fontSize: 11,
    fontWeight: '900',
  },
  chipTextActive: {
    color: liderColors.blue,
  },
});
