import * as SQLite from 'expo-sqlite';

import { runReportMigration } from '../database/migrations/reportMigration';
import { Report, ReportRow } from '../types/reportTypes';

const DATABASE_NAME = 'liderapp.db';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getReportDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await runReportMigration(db);
      return db;
    });
  }

  return databasePromise;
}

export async function createReport(bodyOrEntries: string | string[], entries: string[] = Array.isArray(bodyOrEntries) ? bodyOrEntries : []) {
  const db = await getReportDatabase();
  const now = new Date().toISOString();
  const id = `report-${Date.now()}`;
  const normalizedEntries = entries.map((entry) => entry.trim()).filter(Boolean);
  const body = Array.isArray(bodyOrEntries) ? normalizedEntries.join('\n') : bodyOrEntries.trim();
  const title = `Raport ${new Date().toLocaleDateString('pl-PL')}`;

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT INTO reports (id, title, body, entryCount, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      id,
      title,
      body,
      normalizedEntries.length,
      now,
      now
    );

    for (const [index, entry] of normalizedEntries.entries()) {
      await db.runAsync(
        'INSERT INTO report_entries (id, reportId, content, position, createdAt) VALUES (?, ?, ?, ?, ?)',
        `${id}-entry-${index + 1}`,
        id,
        entry,
        index,
        now
      );
    }
  });

  return getReportById(id);
}

export async function getRecentReports(limit = 10) {
  const db = await getReportDatabase();
  return db.getAllAsync<ReportRow>(
    'SELECT * FROM reports ORDER BY createdAt DESC LIMIT ?',
    limit
  );
}

export async function getReportById(id: string): Promise<Report | null> {
  const db = await getReportDatabase();
  return db.getFirstAsync<ReportRow>('SELECT * FROM reports WHERE id = ?', id);
}
