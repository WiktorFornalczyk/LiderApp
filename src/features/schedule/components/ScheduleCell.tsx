import { Pressable, StyleSheet, Text, View } from 'react-native';

import { liderColors } from '@/components/lider-ui';
import { ScheduleEntryWithEmployee } from '../types/scheduleTypes';
import { getShiftDescription, getShiftShortLabel } from '../utils/shiftUtils';

export function ScheduleCell({
  entry,
  isUpdating,
  onPress,
}: {
  entry?: ScheduleEntryWithEmployee;
  isUpdating?: boolean;
  onPress: () => void;
}) {
  const shiftCode = entry?.shiftCode ?? '0';

  return (
    <Pressable
      accessibilityLabel={`Zmień wpis grafiku: ${getShiftDescription(shiftCode)}`}
      onPress={onPress}
      style={[styles.cell, toneStyle(shiftCode), isUpdating && styles.updating]}>
      <Text style={styles.label}>{isUpdating ? '...' : getShiftShortLabel(shiftCode)}</Text>
    </Pressable>
  );
}

function toneStyle(shiftCode: string) {
  if (shiftCode === '1' || shiftCode === '1_8_16' || shiftCode === '1_12H') {
    return styles.shiftOne;
  }

  if (shiftCode === '2' || shiftCode === '2_12H') {
    return styles.shiftTwo;
  }

  if (shiftCode === '3') {
    return styles.shiftThree;
  }

  if (shiftCode === 'L4') {
    return styles.sick;
  }

  if (shiftCode === 'U') {
    return styles.vacation;
  }

  return styles.off;
}

export function ScheduleCellPlaceholder() {
  return <View style={[styles.cell, styles.off]} />;
}

const styles = StyleSheet.create({
  cell: {
    width: 54,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  label: {
    color: liderColors.text,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  updating: {
    opacity: 0.55,
  },
  shiftOne: {
    backgroundColor: 'rgba(50, 198, 106, 0.38)',
  },
  shiftTwo: {
    backgroundColor: 'rgba(245, 165, 36, 0.38)',
  },
  shiftThree: {
    backgroundColor: 'rgba(45, 124, 255, 0.38)',
  },
  off: {
    backgroundColor: 'rgba(143, 155, 168, 0.16)',
  },
  vacation: {
    backgroundColor: 'rgba(155, 115, 255, 0.32)',
  },
  sick: {
    backgroundColor: 'rgba(255, 92, 66, 0.32)',
  },
});
