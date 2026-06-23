import * as SQLite from 'expo-sqlite';

import { runNotesMigration } from '../database/migrations/notesMigration';
import { Note, NoteInput, NoteRow, NoteSortMode } from '../types/noteTypes';

const DATABASE_NAME = 'liderapp.db';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

function mapRowToNote(row: NoteRow): Note {
  return {
    ...row,
    isImportant: row.isImportant === 1,
  };
}

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await runNotesMigration(db);
      return db;
    });
  }

  return databasePromise;
}

function getOrderBy(sortMode: NoteSortMode = 'updated_desc') {
  if (sortMode === 'updated_asc') {
    return 'updatedAt ASC';
  }

  if (sortMode === 'important_first') {
    return 'isImportant DESC, updatedAt DESC';
  }

  return 'updatedAt DESC';
}

export async function getAllNotes(sortMode: NoteSortMode = 'updated_desc') {
  const db = await getDatabase();
  const rows = await db.getAllAsync<NoteRow>(
    `SELECT * FROM notes ORDER BY ${getOrderBy(sortMode)}`
  );

  return rows.map(mapRowToNote);
}

export async function getImportantNotes(sortMode: NoteSortMode = 'updated_desc') {
  const db = await getDatabase();
  const rows = await db.getAllAsync<NoteRow>(
    `SELECT * FROM notes WHERE isImportant = 1 ORDER BY ${getOrderBy(sortMode)}`
  );

  return rows.map(mapRowToNote);
}

export async function getNoteById(id: string) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<NoteRow>('SELECT * FROM notes WHERE id = ?', id);

  return row ? mapRowToNote(row) : null;
}

export async function createNote(note: Note) {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT INTO notes (id, title, content, isImportant, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    note.id,
    note.title,
    note.content,
    note.isImportant ? 1 : 0,
    note.createdAt,
    note.updatedAt
  );

  return note;
}

export async function updateNote(id: string, noteInput: NoteInput & { updatedAt: string }) {
  const db = await getDatabase();

  await db.runAsync(
    `UPDATE notes
     SET title = ?, content = ?, isImportant = ?, updatedAt = ?
     WHERE id = ?`,
    noteInput.title ?? null,
    noteInput.content,
    noteInput.isImportant ? 1 : 0,
    noteInput.updatedAt,
    id
  );

  return getNoteById(id);
}

export async function deleteNote(id: string) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM notes WHERE id = ?', id);
}

export async function searchNotes(query: string, sortMode: NoteSortMode = 'updated_desc') {
  const db = await getDatabase();
  const normalizedQuery = `%${query.trim().toLowerCase()}%`;
  const rows = await db.getAllAsync<NoteRow>(
    `SELECT * FROM notes
     WHERE lower(coalesce(title, '')) LIKE ? OR lower(content) LIKE ?
     ORDER BY ${getOrderBy(sortMode)}`,
    normalizedQuery,
    normalizedQuery
  );

  return rows.map(mapRowToNote);
}

export async function toggleImportant(id: string) {
  const db = await getDatabase();
  const updatedAt = new Date().toISOString();

  await db.runAsync(
    `UPDATE notes
     SET isImportant = CASE isImportant WHEN 1 THEN 0 ELSE 1 END,
         updatedAt = ?
     WHERE id = ?`,
    updatedAt,
    id
  );

  return getNoteById(id);
}

export async function getImportantNotesCount() {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM notes WHERE isImportant = 1'
  );

  return row?.count ?? 0;
}
