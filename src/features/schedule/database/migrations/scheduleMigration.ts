import { SQLiteDatabase } from 'expo-sqlite';

export async function runScheduleMigration(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      isActive INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS schedule_weeks (
      id TEXT PRIMARY KEY,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS schedule_entries (
      id TEXT PRIMARY KEY,
      scheduleWeekId TEXT NOT NULL,
      employeeId TEXT NOT NULL,
      entryDate TEXT NOT NULL,
      shiftCode TEXT NOT NULL,
      shiftLabel TEXT NOT NULL,
      shiftNumber INTEGER NULL,
      hours INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (scheduleWeekId) REFERENCES schedule_weeks(id) ON DELETE CASCADE,
      FOREIGN KEY (employeeId) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_employees_isActive ON employees(isActive);
    CREATE INDEX IF NOT EXISTS idx_schedule_weeks_startDate ON schedule_weeks(startDate);
    CREATE INDEX IF NOT EXISTS idx_schedule_weeks_endDate ON schedule_weeks(endDate);
    CREATE INDEX IF NOT EXISTS idx_schedule_entries_scheduleWeekId ON schedule_entries(scheduleWeekId);
    CREATE INDEX IF NOT EXISTS idx_schedule_entries_employeeId ON schedule_entries(employeeId);
    CREATE INDEX IF NOT EXISTS idx_schedule_entries_entryDate ON schedule_entries(entryDate);
    CREATE INDEX IF NOT EXISTS idx_schedule_entries_shiftNumber ON schedule_entries(shiftNumber);
  `);
}
