import { Note, NoteInput, NoteSortMode, NotesFilter } from '../types/noteTypes';
import {
  hasNoteValidationErrors,
  noteErrorMessages,
  sanitizeNoteInput,
  validateNoteInput,
} from '../validation/noteValidation';
import * as notesRepository from './notesRepository';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getNotes(options: {
  filter: NotesFilter;
  query: string;
  sortMode: NoteSortMode;
}) {
  const query = options.query.trim();

  if (query) {
    const results = await notesRepository.searchNotes(query, options.sortMode);
    return options.filter === 'important'
      ? results.filter((note) => note.isImportant)
      : results;
  }

  if (options.filter === 'important') {
    return notesRepository.getImportantNotes(options.sortMode);
  }

  return notesRepository.getAllNotes(options.sortMode);
}

export function validateNote(noteInput: NoteInput) {
  return validateNoteInput(noteInput);
}

export async function createNote(noteInput: NoteInput) {
  const sanitizedInput = sanitizeNoteInput(noteInput);
  const errors = validateNoteInput(sanitizedInput);

  if (hasNoteValidationErrors(errors)) {
    throw new Error(Object.values(errors)[0] ?? noteErrorMessages.saveFailed);
  }

  const now = new Date().toISOString();
  const note: Note = {
    id: createId(),
    title: sanitizedInput.title ?? null,
    content: sanitizedInput.content,
    isImportant: sanitizedInput.isImportant,
    createdAt: now,
    updatedAt: now,
  };

  return notesRepository.createNote(note);
}

export async function updateNote(id: string, noteInput: NoteInput) {
  const sanitizedInput = sanitizeNoteInput(noteInput);
  const errors = validateNoteInput(sanitizedInput);

  if (hasNoteValidationErrors(errors)) {
    throw new Error(Object.values(errors)[0] ?? noteErrorMessages.saveFailed);
  }

  return notesRepository.updateNote(id, {
    ...sanitizedInput,
    updatedAt: new Date().toISOString(),
  });
}

export async function getNoteById(id: string) {
  return notesRepository.getNoteById(id);
}

export async function deleteNote(id: string) {
  return notesRepository.deleteNote(id);
}

export async function toggleImportant(id: string) {
  return notesRepository.toggleImportant(id);
}

export async function getImportantNotesCount() {
  return notesRepository.getImportantNotesCount();
}
