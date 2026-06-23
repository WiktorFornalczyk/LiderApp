import { SQLiteDatabase } from 'expo-sqlite';

export async function runNotesMigration(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NULL,
      content TEXT NOT NULL,
      isImportant INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_notes_updatedAt ON notes(updatedAt);
    CREATE INDEX IF NOT EXISTS idx_notes_isImportant ON notes(isImportant);
  `);
}
