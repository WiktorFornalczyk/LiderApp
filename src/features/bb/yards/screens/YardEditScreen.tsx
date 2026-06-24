import { Alert } from 'react-native';

import { YardForm } from '../components/YardForm';
import { Yard, YardInput } from '../types/yardTypes';
import * as yardService from '../services/yardService';

export function YardEditScreen({
  yard,
  onSaved,
  onCancel,
}: {
  yard?: Yard | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  async function save(input: YardInput, allowDuplicate = false) {
    const duplicate = await yardService.hasYardWithName(input.name, yard?.id);

    if (duplicate && !allowDuplicate) {
      Alert.alert('Podobny plac', 'Plac o takiej nazwie już istnieje. Sprawdź, czy nie tworzysz duplikatu.', [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Zapisz mimo to', onPress: () => save(input, true) },
      ]);
      return;
    }

    if (yard) {
      await yardService.updateYard(yard.id, input);
    } else {
      await yardService.createYard(input);
    }

    onSaved();
  }

  return <YardForm yard={yard} onCancel={onCancel} onSubmit={(input) => save(input)} />;
}
