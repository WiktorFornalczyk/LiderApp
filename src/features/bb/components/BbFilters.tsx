import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { liderColors } from '@/components/lider-ui';
import { BbFilters as BbFiltersType } from '../types/bbTypes';
import { YardWithStats } from '../yards/types/yardTypes';

export function BbFilters({
  filters,
  yards,
  onChange,
  onClear,
}: {
  filters: BbFiltersType;
  yards: YardWithStats[];
  onChange: (filters: BbFiltersType) => void;
  onClear: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <SmallInput
          label="Partia"
          value={filters.nrPartii ?? ''}
          onChangeText={(nrPartii) => onChange({ ...filters, nrPartii })}
        />
        <SmallInput
          label="Sadza"
          value={filters.rodzajSadzy ?? ''}
          onChangeText={(rodzajSadzy) => onChange({ ...filters, rodzajSadzy })}
        />
      </View>

      <View style={styles.chips}>
        <FilterChip selected={!filters.placId} label="Wszystkie place" onPress={() => onChange({ ...filters, placId: null })} />
        {yards.map((yard) => (
          <FilterChip
            key={yard.id}
            selected={filters.placId === yard.id}
            label={yard.name}
            onPress={() => onChange({ ...filters, placId: yard.id })}
          />
        ))}
      </View>

      <View style={styles.chips}>
        <FilterChip selected={!filters.linia} label="L-I/L-II" onPress={() => onChange({ ...filters, linia: null })} />
        <FilterChip selected={filters.linia === 'L-I'} label="L-I" onPress={() => onChange({ ...filters, linia: 'L-I' })} />
        <FilterChip selected={filters.linia === 'L-II'} label="L-II" onPress={() => onChange({ ...filters, linia: 'L-II' })} />
        <FilterChip
          selected={filters.paleta === 'drewniana'}
          label="Drewniana"
          onPress={() => onChange({ ...filters, paleta: 'drewniana' })}
        />
        <FilterChip
          selected={filters.paleta === 'plastikowa'}
          label="Plastikowa"
          onPress={() => onChange({ ...filters, paleta: 'plastikowa' })}
        />
        <FilterChip selected={filters.paleta === 'empty'} label="Bez palety" onPress={() => onChange({ ...filters, paleta: 'empty' })} />
      </View>

      <View style={styles.chips}>
        <FilterChip selected={filters.strecz === true} label="Strecz: tak" onPress={() => onChange({ ...filters, strecz: true })} />
        <FilterChip selected={filters.strecz === false} label="Strecz: nie" onPress={() => onChange({ ...filters, strecz: false })} />
        <FilterChip
          selected={filters.kapturownica === true}
          label="Kapt.: tak"
          onPress={() => onChange({ ...filters, kapturownica: true })}
        />
        <FilterChip
          selected={filters.kapturownica === false}
          label="Kapt.: nie"
          onPress={() => onChange({ ...filters, kapturownica: false })}
        />
      </View>

      <Pressable onPress={onClear} style={styles.clearButton}>
        <Ionicons name="close-circle-outline" size={18} color={liderColors.blue} />
        <Text style={styles.clearText}>Wyczyść filtry</Text>
      </Pressable>
    </View>
  );
}

function SmallInput({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={liderColors.dim}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
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
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    gap: 5,
  },
  inputLabel: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  input: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surface,
    color: liderColors.text,
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '800',
  },
  chips: {
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
  chipText: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  chipTextActive: {
    color: liderColors.blue,
  },
  clearButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
  },
  clearText: {
    color: liderColors.blue,
    fontSize: 12,
    fontWeight: '900',
  },
});
