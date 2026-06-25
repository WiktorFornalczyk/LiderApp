import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, liderColors, SectionTitle } from '@/components/lider-ui';
import { CalendarEventInput, CalendarEventValidationErrors } from '../types/calendarTypes';
import { CalendarEventTypePicker } from './CalendarEventTypePicker';

export function CalendarEventForm({
  input,
  errors,
  submitLabel = 'Zapisz',
  onChange,
  onSubmit,
}: {
  input: CalendarEventInput;
  errors: CalendarEventValidationErrors;
  submitLabel?: string;
  onChange: (input: CalendarEventInput) => void;
  onSubmit: () => void;
}) {
  const canSubmit = input.title.trim().length > 0 && input.eventDate.trim().length > 0 && Object.values(errors).every((error) => !error);

  function patch(values: Partial<CalendarEventInput>) {
    onChange({ ...input, ...values });
  }

  return (
    <View style={styles.wrap}>
      <SectionTitle>Dane wydarzenia</SectionTitle>
      <Card style={styles.card}>
        <Field label="Tytuł" error={errors.title}>
          <TextInput
            onChangeText={(title) => patch({ title })}
            placeholder="Tytuł wydarzenia"
            placeholderTextColor={liderColors.dim}
            style={styles.input}
            value={input.title}
          />
        </Field>
        <Field label="Opis" error={errors.description}>
          <TextInput
            multiline
            onChangeText={(description) => patch({ description })}
            placeholder="Opis opcjonalny"
            placeholderTextColor={liderColors.dim}
            style={[styles.input, styles.textArea]}
            textAlignVertical="top"
            value={input.description ?? ''}
          />
        </Field>
      </Card>

      <SectionTitle>Termin</SectionTitle>
      <Card style={styles.card}>
        <Field label="Data" error={errors.eventDate}>
          <TextInput
            onChangeText={(eventDate) => patch({ eventDate })}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={liderColors.dim}
            style={styles.input}
            value={input.eventDate}
          />
        </Field>
        <Pressable onPress={() => patch({ isAllDay: !input.isAllDay, eventTime: input.isAllDay ? input.eventTime : null })} style={styles.toggle}>
          <View style={[styles.checkbox, input.isAllDay && styles.checkboxActive]} />
          <Text style={styles.toggleText}>Cały dzień</Text>
        </Pressable>
        {!input.isAllDay ? (
          <Field label="Godzina" error={errors.eventTime}>
            <TextInput
              onChangeText={(eventTime) => patch({ eventTime })}
              placeholder="HH:mm"
              placeholderTextColor={liderColors.dim}
              style={styles.input}
              value={input.eventTime ?? ''}
            />
          </Field>
        ) : null}
      </Card>

      <SectionTitle>Typ wydarzenia</SectionTitle>
      <Card style={styles.card}>
        <CalendarEventTypePicker value={input.eventType} onChange={(eventType) => patch({ eventType })} />
      </Card>

      <Pressable disabled={!canSubmit} onPress={onSubmit} style={[styles.button, !canSubmit && styles.disabled]}>
        <Text style={styles.buttonText}>{submitLabel}</Text>
      </Pressable>
    </View>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  card: {
    gap: 12,
    padding: 14,
  },
  field: {
    gap: 7,
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
    minHeight: 110,
    paddingTop: 12,
  },
  toggle: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 6,
  },
  checkboxActive: {
    borderColor: liderColors.blue,
    backgroundColor: liderColors.blue,
  },
  toggleText: {
    color: liderColors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  error: {
    color: liderColors.red,
    fontSize: 11,
    fontWeight: '800',
  },
  button: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: liderColors.blue,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
});
