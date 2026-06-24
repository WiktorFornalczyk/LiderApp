import { StyleSheet, Text, View } from 'react-native';

import { liderColors } from '@/components/lider-ui';
import { getAllShiftOptions } from '../utils/shiftUtils';

export function ScheduleLegend() {
  return (
    <View style={styles.legend}>
      {getAllShiftOptions().map((option) => (
        <View key={option.code} style={styles.item}>
          <Text style={styles.code}>{option.label}</Text>
          <Text style={styles.description}>{option.description}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    gap: 8,
  },
  item: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surface,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  code: {
    width: 58,
    color: liderColors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  description: {
    flex: 1,
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
});
