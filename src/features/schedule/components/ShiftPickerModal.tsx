import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { liderColors } from '@/components/lider-ui';
import { ShiftCode } from '../types/scheduleTypes';
import { getAllShiftOptions } from '../utils/shiftUtils';

export function ShiftPickerModal({
  visible,
  currentShiftCode,
  title,
  onClose,
  onSelect,
}: {
  visible: boolean;
  currentShiftCode?: string;
  title?: string;
  onClose: () => void;
  onSelect: (shiftCode: ShiftCode) => void;
}) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{title ?? 'Wybierz zmianę'}</Text>
              <Text style={styles.subtitle}>Po wyborze zmiana zapisze się lokalnie.</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={liderColors.text} />
            </Pressable>
          </View>

          <View style={styles.grid}>
            {getAllShiftOptions().map((option) => (
              <Pressable
                key={option.code}
                onPress={() => onSelect(option.code)}
                style={[styles.tile, currentShiftCode === option.code && styles.tileActive]}>
                <Text style={styles.tileLabel}>{option.label}</Text>
                <Text style={styles.tileDescription}>{option.description}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: liderColors.border,
    backgroundColor: liderColors.surface,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  title: {
    color: liderColors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: liderColors.surfaceAlt,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    width: '31%',
    minWidth: 96,
    minHeight: 96,
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    padding: 10,
  },
  tileActive: {
    borderColor: liderColors.blue,
    backgroundColor: 'rgba(45, 124, 255, 0.18)',
  },
  tileLabel: {
    color: liderColors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  tileDescription: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
});
