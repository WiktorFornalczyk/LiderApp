import { Pressable, StyleSheet, Text, View } from 'react-native';

import { liderColors } from '@/components/lider-ui';
import { NotesFilter } from '../types/noteTypes';

type NotesFilterTabsProps = {
  value: NotesFilter;
  onChange: (value: NotesFilter) => void;
};

const filters: { label: string; value: NotesFilter }[] = [
  { label: 'Wszystkie', value: 'all' },
  { label: 'Ważne', value: 'important' },
];

export function NotesFilterTabs({ value, onChange }: NotesFilterTabsProps) {
  return (
    <View style={styles.container}>
      {filters.map((filter) => {
        const isActive = filter.value === value;

        return (
          <Pressable
            key={filter.value}
            onPress={() => onChange(filter.value)}
            style={[styles.tab, isActive && styles.tabActive]}>
            <Text style={[styles.label, isActive && styles.labelActive]}>{filter.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    padding: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: liderColors.blue,
  },
  label: {
    color: liderColors.muted,
    fontSize: 13,
    fontWeight: '900',
  },
  labelActive: {
    color: '#ffffff',
  },
});
