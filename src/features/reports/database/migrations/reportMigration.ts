import { SQLiteDatabase } from 'expo-sqlite';

export async function runReportMigration(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      entryCount INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS report_entries (
      id TEXT PRIMARY KEY NOT NULL,
      reportId TEXT NOT NULL,
      content TEXT NOT NULL,
      position INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (reportId) REFERENCES reports(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_reports_createdAt ON reports(createdAt);
    CREATE INDEX IF NOT EXISTS idx_report_entries_reportId ON report_entries(reportId);
  `);
}
