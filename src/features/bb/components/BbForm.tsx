import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Card, liderColors, SectionTitle } from '@/components/lider-ui';
import { BbInput, BbRecord } from '../types/bbTypes';
import { YardWithStats } from '../yards/types/yardTypes';
import { validateBb } from '../services/bbService';

const emptyInput: BbInput = {
  placId: '',
  nrPartii: '',
  rodzajSadzy: '',
  bbOd: '',
  bbDo: '',
  linia: '',
  paleta: null,
  strecz: false,
  kapturownica: false,
  uwagi: null,
};

export function BbForm({
  yards,
  carbonTypes,
  initialInput,
  record,
  submitLabel = 'Zapisz BB',
  onSubmit,
  onCancel,
}: {
  yards: YardWithStats[];
  carbonTypes: string[];
  initialInput?: Partial<BbInput>;
  record?: BbRecord | null;
  submitLabel?: string;
  onSubmit: (input: BbInput) => void;
  onCancel?: () => void;
}) {
  const [input, setInput] = useState<BbInput>(() => buildInitialInput(record, initialInput));
  const errors = useMemo(() => validateBb(input), [input]);
  const isValid = !Object.values(errors).some(Boolean);

  useEffect(() => {
    setInput(buildInitialInput(record, initialInput));
  }, [initialInput, record]);

  function patch(next: Partial<BbInput>) {
    setInput((value) => ({ ...value, ...next }));
  }

  return (
    <View style={styles.form}>
      <SectionTitle>Plac</SectionTitle>
      <Card style={styles.section}>
        <View style={styles.chips}>
          {yards.map((yard) => (
            <Choice
              key={yard.id}
              selected={input.placId === yard.id}
              label={yard.name}
              onPress={() => patch({ placId: yard.id })}
            />
          ))}
        </View>
        {errors.placId ? <Text style={styles.error}>{errors.placId}</Text> : null}
      </Card>

      <SectionTitle>Partia i sadza</SectionTitle>
      <Card style={styles.section}>
        <Input label="Nr Partii" value={input.nrPartii} onChangeText={(nrPartii) => patch({ nrPartii })} error={errors.nrPartii} />
        <Input
          label="Rodzaj sadzy"
          value={input.rodzajSadzy}
          onChangeText={(rodzajSadzy) => patch({ rodzajSadzy })}
          error={errors.rodzajSadzy}
        />
        {carbonTypes.length > 0 ? (
          <View style={styles.chips}>
            {carbonTypes.map((type) => (
              <Choice key={type} selected={input.rodzajSadzy === type} label={type} onPress={() => patch({ rodzajSadzy: type })} />
            ))}
          </View>
        ) : null}
      </Card>

      <SectionTitle>Zakres BB</SectionTitle>
      <Card style={styles.section}>
        <View style={styles.row}>
          <Input label="BB od" value={String(input.bbOd)} onChangeText={(bbOd) => patch({ bbOd })} error={errors.bbOd} />
          <Input label="BB do" value={String(input.bbDo)} onChangeText={(bbDo) => patch({ bbDo })} error={errors.bbDo} />
        </View>
      </Card>

      <SectionTitle>Linia i wyposażenie</SectionTitle>
      <Card style={styles.section}>
        <View style={styles.chips}>
          <Choice selected={input.linia === 'L-I'} label="L-I" onPress={() => patch({ linia: 'L-I' })} />
          <Choice selected={input.linia === 'L-II'} label="L-II" onPress={() => patch({ linia: 'L-II' })} />
        </View>
        {errors.linia ? <Text style={styles.error}>{errors.linia}</Text> : null}
        <View style={styles.chips}>
          <Choice selected={input.paleta === null} label="Brudne" onPress={() => patch({ paleta: null })} />
          <Choice selected={input.paleta === 'drewniana'} label="Drewniana" onPress={() => patch({ paleta: 'drewniana' })} />
          <Choice selected={input.paleta === 'plastikowa'} label="Plastikowa" onPress={() => patch({ paleta: 'plastikowa' })} />
        </View>
        <SwitchRow label="Strecz" value={Boolean(input.strecz)} onValueChange={(strecz) => patch({ strecz })} />
        <SwitchRow
          label="Kapturownica"
          value={Boolean(input.kapturownica)}
          onValueChange={(kapturownica) => patch({ kapturownica })}
        />
      </Card>

      <SectionTitle>Uwagi</SectionTitle>
      <Card style={styles.section}>
        <TextInput
          multiline
          onChangeText={(uwagi) => patch({ uwagi })}
          placeholder="Opcjonalne uwagi"
          placeholderTextColor={liderColors.dim}
          style={[styles.input, styles.textArea]}
          value={input.uwagi ?? ''}
        />
      </Card>

      <View style={styles.actions}>
        {onCancel ? (
          <Pressable onPress={onCancel} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Anuluj</Text>
          </Pressable>
        ) : null}
        <Pressable disabled={!isValid} onPress={() => onSubmit(input)} style={[styles.submitButton, !isValid && styles.disabled]}>
          <Text style={styles.submitText}>{submitLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function buildInitialInput(record?: BbRecord | null, initialInput?: Partial<BbInput>): BbInput {
  if (record) {
    return {
      placId: record.placId,
      nrPartii: record.nrPartii,
      rodzajSadzy: record.rodzajSadzy,
      bbOd: String(record.bbOd),
      bbDo: String(record.bbDo),
      linia: record.linia,
      paleta: record.paleta,
      strecz: record.strecz,
      kapturownica: record.kapturownica,
      uwagi: record.uwagi,
    };
  }

  return { ...emptyInput, ...initialInput };
}

function Input({
  label,
  value,
  onChangeText,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
}) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={liderColors.dim}
        style={styles.input}
        value={value}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}>
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function SwitchRow({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
  },
  section: {
    gap: 12,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    gap: 5,
  },
  label: {
    color: liderColors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    color: liderColors.text,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '800',
  },
  textArea: {
    minHeight: 86,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  error: {
    color: liderColors.red,
    fontSize: 11,
    fontWeight: '800',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choice: {
    minHeight: 38,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    paddingHorizontal: 10,
  },
  choiceSelected: {
    borderColor: liderColors.blue,
    backgroundColor: 'rgba(45, 124, 255, 0.16)',
  },
  choiceText: {
    color: liderColors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  choiceTextSelected: {
    color: liderColors.blue,
  },
  switchRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    backgroundColor: liderColors.surfaceSoft,
    paddingHorizontal: 12,
  },
  switchLabel: {
    color: liderColors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  submitButton: {
    flex: 1,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: liderColors.blue,
  },
  disabled: {
    opacity: 0.55,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  secondaryButton: {
    minHeight: 50,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  secondaryText: {
    color: liderColors.muted,
    fontSize: 13,
    fontWeight: '900',
  },
});
