import { Pressable, StyleSheet, Text, View } from 'react-native';

import { liderColors } from '@/components/lider-ui';
import { BbSortMode } from '../types/bbTypes';

const options: { label: string; value: BbSortMode }[] = [
  { label: 'Najnowsze', value: 'newest' },
  { label: 'Najstarsze', value: 'oldest' },
  { label: 'Nr partii', value: 'nrPartii' },
  { label: 'Plac', value: 'yard' },
  { label: 'Zakres BB', value: 'range' },
  { label: 'Sadza', value: 'rodzajSadzy' },
];

export function BbSortPicker({ value, onChange }: { value: BbSortMode; onChange: (value: BbSortMode) => void }) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => onChange(option.value)}
          style={[styles.chip, value === option.value && styles.chipActive]}>
          <Text style={[styles.text, value === option.value && styles.textActive]}>{option.label}</Text>
        </Pressable>
      ))}
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
    minHeight: 34,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surface,
    paddingHorizontal: 10,
  },
  chipActive: {
    borderColor: liderColors.blue,
    backgroundColor: 'rgba(45, 124, 255, 0.16)',
  },
  text: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  textActive: {
    color: liderColors.blue,
  },
});
