import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { liderColors } from '@/components/lider-ui';
import { ScheduleWeekInput } from '../types/scheduleTypes';

export function ScheduleToolbar({
  range,
  canUseScheduleActions,
  onRangeChange,
  onCreate,
  onCurrentWeek,
  onPreviousWeek,
  onNextWeek,
  onCopyPrevious,
  onClear,
  onDelete,
  onExport,
}: {
  range: ScheduleWeekInput;
  canUseScheduleActions: boolean;
  onRangeChange: (range: ScheduleWeekInput) => void;
  onCreate: () => void;
  onCurrentWeek: () => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onCopyPrevious: () => void;
  onClear: () => void;
  onDelete: () => void;
  onExport: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.dateRow}>
        <DateInput
          label="Od"
          value={range.startDate}
          onChangeText={(startDate) => onRangeChange({ ...range, startDate })}
        />
        <DateInput
          label="Do"
          value={range.endDate}
          onChangeText={(endDate) => onRangeChange({ ...range, endDate })}
        />
      </View>

      <View style={styles.navRow}>
        <ToolButton icon="chevron-back" label="Poprzedni" onPress={onPreviousWeek} tone="neutral" />
        <ToolButton icon="calendar-outline" label="Dzisiaj" onPress={onCurrentWeek} tone="neutral" />
        <ToolButton icon="chevron-forward" label="Następny" onPress={onNextWeek} tone="neutral" />
      </View>

      <Pressable onPress={onCreate} style={styles.createButton}>
        <Ionicons name="add-circle-outline" size={22} color="#ffffff" />
        <Text style={styles.createButtonText}>Utwórz grafik</Text>
      </Pressable>

      <View style={styles.actionGrid}>
        <ToolButton
          disabled={!canUseScheduleActions}
          icon="copy-outline"
          label="Kopiuj z poprzedniego tygodnia"
          onPress={onCopyPrevious}
        />
        <ToolButton
          disabled={!canUseScheduleActions}
          icon="trash-outline"
          label="Wyczyść grafik"
          onPress={onClear}
          tone="amber"
        />
        <ToolButton
          disabled={!canUseScheduleActions}
          icon="document-text-outline"
          label="Eksport DOCX"
          onPress={onExport}
          tone="green"
        />
        <ToolButton
          disabled={!canUseScheduleActions}
          icon="close-circle-outline"
          label="Usuń grafik"
          onPress={onDelete}
          tone="red"
        />
      </View>
    </View>
  );
}

function DateInput({
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
        autoCapitalize="none"
        keyboardType="numbers-and-punctuation"
        onChangeText={onChangeText}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={liderColors.dim}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

function ToolButton({
  icon,
  label,
  onPress,
  disabled,
  tone = 'blue',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'neutral';
}) {
  const color =
    tone === 'green'
      ? liderColors.green
      : tone === 'amber'
        ? liderColors.amber
        : tone === 'red'
          ? liderColors.red
          : tone === 'neutral'
            ? liderColors.muted
            : liderColors.blue;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.toolButton, disabled && styles.disabledButton]}>
      <Ionicons name={icon} size={18} color={disabled ? liderColors.dim : color} />
      <Text style={[styles.toolButtonText, { color: disabled ? liderColors.dim : color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  dateRow: {
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
    minHeight: 46,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surface,
    color: liderColors.text,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '800',
  },
  navRow: {
    flexDirection: 'row',
    gap: 8,
  },
  createButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 8,
    backgroundColor: liderColors.blue,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toolButton: {
    minHeight: 42,
    flexGrow: 1,
    flexBasis: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    paddingHorizontal: 10,
  },
  disabledButton: {
    opacity: 0.55,
  },
  toolButtonText: {
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
});
