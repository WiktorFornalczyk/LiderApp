import { SQLiteDatabase } from 'expo-sqlite';

export async function runCalendarMigration(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NULL,
      eventDate TEXT NOT NULL,
      eventTime TEXT NULL,
      eventType TEXT NULL,
      isAllDay INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_calendar_events_eventDate ON calendar_events(eventDate);
    CREATE INDEX IF NOT EXISTS idx_calendar_events_eventType ON calendar_events(eventType);
    CREATE INDEX IF NOT EXISTS idx_calendar_events_updatedAt ON calendar_events(updatedAt);
  `);
}
