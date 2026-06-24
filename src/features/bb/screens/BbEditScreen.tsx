import { Alert } from 'react-native';

import { BbForm } from '../components/BbForm';
import { BbDuplicateWarning } from '../components/BbDuplicateWarning';
import { BbDuplicateResult, BbInput, BbRecordWithYard } from '../types/bbTypes';
import { YardWithStats } from '../yards/types/yardTypes';
import * as bbService from '../services/bbService';
import { useState } from 'react';

export function BbEditScreen({
  record,
  yards,
  carbonTypes,
  onSaved,
  onCancel,
}: {
  record: BbRecordWithYard;
  yards: YardWithStats[];
  carbonTypes: string[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [conflict, setConflict] = useState<BbDuplicateResult | null>(null);

  function cancelWithWarning() {
    Alert.alert('Masz niezapisane zmiany. Czy chcesz wyjść bez zapisywania?', undefined, [
      { text: 'Zostań', style: 'cancel' },
      { text: 'Wyjdź', style: 'destructive', onPress: onCancel },
    ]);
  }

  async function save(input: BbInput, allowConflict = false) {
    const nextConflict = await bbService.getPotentialConflict(input, record.id);

    if (nextConflict && !allowConflict) {
      setConflict(nextConflict);
      Alert.alert('Możliwy konflikt', bbService.getConflictMessage(nextConflict), [
        { text: 'Sprawdź', style: 'cancel' },
        { text: 'Zapisz mimo to', onPress: () => save(input, true) },
      ]);
      return;
    }

    await bbService.updateBbRecord(record.id, input);
    Alert.alert('Zapisano BB', 'Zmiany zostały zapisane.');
    onSaved();
  }

  return (
    <>
      <BbDuplicateWarning conflict={conflict} />
      <BbForm
        carbonTypes={carbonTypes}
        record={record}
        submitLabel="Zapisz zmiany"
        yards={yards}
        onCancel={cancelWithWarning}
        onSubmit={(input) => save(input)}
      />
    </>
  );
}
