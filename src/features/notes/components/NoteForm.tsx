import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, liderColors } from '@/components/lider-ui';
import { Note, NoteInput, NoteValidationErrors } from '../types/noteTypes';
import {
  NOTE_CONTENT_MAX_LENGTH,
  NOTE_TITLE_MAX_LENGTH,
  validateNoteInput,
} from '../validation/noteValidation';

type NoteFormProps = {
  initialNote?: Note;
  isSaving?: boolean;
  submitLabel: string;
  onSubmit: (input: NoteInput) => Promise<void> | void;
  onDirtyChange?: (isDirty: boolean) => void;
};

export function NoteForm({
  initialNote,
  isSaving = false,
  submitLabel,
  onSubmit,
  onDirtyChange,
}: NoteFormProps) {
  const [title, setTitle] = useState(initialNote?.title ?? '');
  const [content, setContent] = useState(initialNote?.content ?? '');
  const [isImportant, setIsImportant] = useState(initialNote?.isImportant ?? false);
  const [errors, setErrors] = useState<NoteValidationErrors>({});

  const initialState = useMemo(
    () => ({
      title: initialNote?.title ?? '',
      content: initialNote?.content ?? '',
      isImportant: initialNote?.isImportant ?? false,
    }),
    [initialNote]
  );

  const input = { title, content, isImportant };
  const isContentReady = content.trim().length > 0;
  const isDirty =
    title !== initialState.title ||
    content !== initialState.content ||
    isImportant !== initialState.isImportant;

  function updateDirtyState(nextInput: NoteInput) {
    const nextIsDirty =
      (nextInput.title ?? '') !== initialState.title ||
      nextInput.content !== initialState.content ||
      nextInput.isImportant !== initialState.isImportant;

    onDirtyChange?.(nextIsDirty);
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    updateDirtyState({ ...input, title: value });
  }

  function handleContentChange(value: string) {
    setContent(value);
    updateDirtyState({ ...input, content: value });
  }

  function handleImportantChange() {
    const nextValue = !isImportant;
    setIsImportant(nextValue);
    updateDirtyState({ ...input, isImportant: nextValue });
  }

  async function handleSubmit() {
    const nextErrors = validateNoteInput(input);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit(input);
  }

  return (
    <View style={styles.wrap}>
      <Card style={styles.formCard}>
        <View style={styles.field}>
          <Text style={styles.label}>Tytuł</Text>
          <TextInput
            maxLength={NOTE_TITLE_MAX_LENGTH}
            onChangeText={handleTitleChange}
            placeholder="Opcjonalny tytuł"
            placeholderTextColor={liderColors.dim}
            style={[styles.input, errors.title && styles.inputError]}
            value={title}
          />
          <View style={styles.fieldHintRow}>
            {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : <View />}
            <Text style={styles.counter}>{title.length}/{NOTE_TITLE_MAX_LENGTH}</Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Treść</Text>
          <TextInput
            maxLength={NOTE_CONTENT_MAX_LENGTH}
            multiline
            onChangeText={handleContentChange}
            placeholder="Zapisz krótką informację, przypomnienie albo sprawę do wykonania..."
            placeholderTextColor={liderColors.dim}
            style={[styles.contentInput, errors.content && styles.inputError]}
            textAlignVertical="top"
            value={content}
          />
          <View style={styles.fieldHintRow}>
            {errors.content ? <Text style={styles.errorText}>{errors.content}</Text> : <View />}
            <Text style={styles.counter}>{content.length}/{NOTE_CONTENT_MAX_LENGTH}</Text>
          </View>
        </View>

        <Pressable onPress={handleImportantChange} style={styles.importantToggle}>
          <Ionicons
            name={isImportant ? 'star' : 'star-outline'}
            size={22}
            color={isImportant ? liderColors.amber : liderColors.muted}
          />
          <Text style={styles.importantText}>Oznacz jako ważną</Text>
        </Pressable>
      </Card>

      <Pressable
        disabled={!isContentReady || isSaving || !isDirty}
        onPress={handleSubmit}
        style={[
          styles.saveButton,
          (!isContentReady || isSaving || !isDirty) && styles.saveButtonDisabled,
        ]}>
        <Text style={styles.saveButtonText}>{isSaving ? 'Zapisywanie...' : submitLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
  },
  formCard: {
    padding: 14,
    gap: 16,
  },
  field: {
    gap: 7,
  },
  label: {
    color: liderColors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    color: liderColors.text,
    backgroundColor: liderColors.surfaceSoft,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  contentInput: {
    minHeight: 190,
    borderWidth: 1,
    borderColor: liderColors.borderSoft,
    borderRadius: 8,
    color: liderColors.text,
    backgroundColor: liderColors.surfaceSoft,
    padding: 12,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  inputError: {
    borderColor: liderColors.red,
  },
  fieldHintRow: {
    minHeight: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  errorText: {
    flex: 1,
    color: liderColors.red,
    fontSize: 11,
    fontWeight: '800',
  },
  counter: {
    color: liderColors.dim,
    fontSize: 11,
    fontWeight: '700',
  },
  importantToggle: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 165, 36, 0.11)',
    paddingHorizontal: 12,
  },
  importantText: {
    color: liderColors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  saveButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: liderColors.blue,
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
});
