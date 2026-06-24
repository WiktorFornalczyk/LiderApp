import { Alert } from 'react-native';

import { BbForm } from '../components/BbForm';
import { BbDuplicateWarning } from '../components/BbDuplicateWarning';
import { BbDuplicateResult, BbInput } from '../types/bbTypes';
import { YardWithStats } from '../yards/types/yardTypes';
import * as bbService from '../services/bbService';
import { useState } from 'react';

export function BbCreateScreen({
  yards,
  carbonTypes,
  initialInput,
  onSaved,
  onCancel,
}: {
  yards: YardWithStats[];
  carbonTypes: string[];
  initialInput?: Partial<BbInput>;
  onSaved: (keepAdding?: boolean) => void;
  onCancel: () => void;
}) {
  const [conflict, setConflict] = useState<BbDuplicateResult | null>(null);

  async function save(input: BbInput, allowConflict = false) {
    const nextConflict = await bbService.getPotentialConflict(input);

    if (nextConflict && !allowConflict) {
      setConflict(nextConflict);
      Alert.alert('Możliwy konflikt', bbService.getConflictMessage(nextConflict), [
        { text: 'Sprawdź', style: 'cancel' },
        { text: 'Zapisz mimo to', onPress: () => save(input, true) },
      ]);
      return;
    }

    await bbService.createBbRecord(input);
    Alert.alert('Zapisano BB', 'Zapis BB został dodany.', [
      { text: 'Dodaj kolejny', onPress: () => onSaved(true) },
      { text: 'Zakończ', onPress: () => onSaved(false) },
    ]);
  }

  return (
    <>
      <BbDuplicateWarning conflict={conflict} />
      <BbForm
        carbonTypes={carbonTypes}
        initialInput={initialInput}
        yards={yards}
        onCancel={onCancel}
        onSubmit={(input) => save(input)}
      />
    </>
  );
}
