import { NoteInput, NoteValidationErrors } from '../types/noteTypes';

export const NOTE_TITLE_MAX_LENGTH = 80;
export const NOTE_CONTENT_MAX_LENGTH = 5000;

export const noteErrorMessages = {
  contentRequired: 'Treść notatki jest wymagana.',
  titleTooLong: 'Tytuł może mieć maksymalnie 80 znaków.',
  contentTooLong: 'Treść notatki może mieć maksymalnie 5000 znaków.',
  saveFailed: 'Nie udało się zapisać notatki.',
  deleteFailed: 'Nie udało się usunąć notatki.',
  loadFailed: 'Nie udało się wczytać notatek.',
};

export function sanitizeNoteInput(input: NoteInput): NoteInput {
  const title = input.title?.trim() || null;

  return {
    title,
    content: input.content.trim(),
    isImportant: input.isImportant,
  };
}

export function validateNoteInput(input: NoteInput): NoteValidationErrors {
  const errors: NoteValidationErrors = {};
  const title = input.title?.trim() ?? '';
  const content = input.content.trim();

  if (!content) {
    errors.content = noteErrorMessages.contentRequired;
  }

  if (title.length > NOTE_TITLE_MAX_LENGTH) {
    errors.title = noteErrorMessages.titleTooLong;
  }

  if (content.length > NOTE_CONTENT_MAX_LENGTH) {
    errors.content = noteErrorMessages.contentTooLong;
  }

  return errors;
}

export function hasNoteValidationErrors(errors: NoteValidationErrors) {
  return Object.keys(errors).length > 0;
}
