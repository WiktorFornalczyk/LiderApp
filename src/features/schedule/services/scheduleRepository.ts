import * as SQLite from 'expo-sqlite';

import { runScheduleMigration } from '../database/migrations/scheduleMigration';
import { EmployeeRow } from '../types/employeeTypes';
import {
  ScheduleEntry,
  ScheduleEntryRow,
  ScheduleEntryWithEmployee,
  ScheduleWeek,
  ScheduleWeekInput,
  ScheduleWeekRow,
  ShiftCode,
} from '../types/scheduleTypes';
import { addDays, getDateRange, getPreviousRange } from '../utils/dateRangeUtils';
import { getShiftHours, getShiftLabel, getShiftNumber } from '../utils/shiftUtils';

const DATABASE_NAME = 'liderapp.db';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

function mapEntryRow(row: ScheduleEntryRow): ScheduleEntry {
  return {
    ...row,
    shiftCode: row.shiftCode as ShiftCode,
  };
}

function mapEntryWithEmployeeRow(
  row: ScheduleEntryRow & EmployeeRow & { employeeCreatedAt: string; employeeUpdatedAt: string }
): ScheduleEntryWithEmployee {
  return {
    id: row.id,
    scheduleWeekId: row.scheduleWeekId,
    employeeId: row.employeeId,
    entryDate: row.entryDate,
    shiftCode: row.shiftCode as ShiftCode,
    shiftLabel: row.shiftLabel,
    shiftNumber: row.shiftNumber,
    hours: row.hours,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    employee: {
      id: row.employeeId,
      fullName: row.fullName,
      isActive: row.isActive === 1,
      createdAt: row.employeeCreatedAt,
      updatedAt: row.employeeUpdatedAt,
    },
  };
}

export async function getScheduleDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await runScheduleMigration(db);
      return db;
    });
  }

  return databasePromise;
}

export async function getScheduleWeeks() {
  const db = await getScheduleDatabase();
  return db.getAllAsync<ScheduleWeekRow>(
    'SELECT * FROM schedule_weeks ORDER BY startDate DESC, endDate DESC'
  );
}

export async function getScheduleWeekById(id: string) {
  const db = await getScheduleDatabase();
  return db.getFirstAsync<ScheduleWeekRow>('SELECT * FROM schedule_weeks WHERE id = ?', id);
}

export async function getScheduleWeekByDate(date: string) {
  const db = await getScheduleDatabase();
  return db.getFirstAsync<ScheduleWeekRow>(
    `SELECT * FROM schedule_weeks
     WHERE startDate <= ? AND endDate >= ?
     ORDER BY startDate DESC
     LIMIT 1`,
    date,
    date
  );
}

export async function getScheduleWeekByRange(input: ScheduleWeekInput) {
  const db = await getScheduleDatabase();
  return db.getFirstAsync<ScheduleWeekRow>(
    'SELECT * FROM schedule_weeks WHERE startDate = ? AND endDate = ?',
    input.startDate,
    input.endDate
  );
}

export async function getScheduleEntries(scheduleWeekId: string) {
  const db = await getScheduleDatabase();
  const rows = await db.getAllAsync<ScheduleEntryRow>(
    `SELECT * FROM schedule_entries
     WHERE scheduleWeekId = ?
     ORDER BY entryDate ASC`,
    scheduleWeekId
  );

  return rows.map(mapEntryRow);
}

export async function getScheduleEntriesWithEmployees(scheduleWeekId: string) {
  const db = await getScheduleDatabase();
  const rows = await db.getAllAsync<ScheduleEntryRow & EmployeeRow & { employeeCreatedAt: string; employeeUpdatedAt: string }>(
    `SELECT se.*, e.fullName, e.isActive, e.createdAt as employeeCreatedAt, e.updatedAt as employeeUpdatedAt
     FROM schedule_entries se
     JOIN employees e ON e.id = se.employeeId
     WHERE se.scheduleWeekId = ?
     ORDER BY e.fullName COLLATE NOCASE ASC, se.entryDate ASC`,
    scheduleWeekId
  );

  return rows.map(mapEntryWithEmployeeRow);
}

export async function getScheduleEntriesForDates(dates: string[]) {
  if (dates.length === 0) {
    return [];
  }

  const db = await getScheduleDatabase();
  const placeholders = dates.map(() => '?').join(', ');
  const rows = await db.getAllAsync<ScheduleEntryRow & EmployeeRow & { employeeCreatedAt: string; employeeUpdatedAt: string }>(
    `SELECT se.*, e.fullName, e.isActive, e.createdAt as employeeCreatedAt, e.updatedAt as employeeUpdatedAt
     FROM schedule_entries se
     JOIN employees e ON e.id = se.employeeId
     WHERE se.entryDate IN (${placeholders})
     ORDER BY se.entryDate ASC, e.fullName COLLATE NOCASE ASC`,
    ...dates
  );

  return rows.map(mapEntryWithEmployeeRow);
}

export async function createScheduleWeek(input: ScheduleWeek) {
  const db = await getScheduleDatabase();
  await db.runAsync(
    `INSERT INTO schedule_weeks (id, startDate, endDate, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?)`,
    input.id,
    input.startDate,
    input.endDate,
    input.createdAt,
    input.updatedAt
  );

  return input;
}

export async function createScheduleEntries(entries: ScheduleEntry[]) {
  const db = await getScheduleDatabase();

  await db.withTransactionAsync(async () => {
    for (const entry of entries) {
      await db.runAsync(
        `INSERT INTO schedule_entries (
          id, scheduleWeekId, employeeId, entryDate, shiftCode, shiftLabel,
          shiftNumber, hours, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        entry.id,
        entry.scheduleWeekId,
        entry.employeeId,
        entry.entryDate,
        entry.shiftCode,
        entry.shiftLabel,
        entry.shiftNumber,
        entry.hours,
        entry.createdAt,
        entry.updatedAt
      );
    }
  });
}

export async function updateScheduleEntry(entryId: string, shiftCode: ShiftCode) {
  const db = await getScheduleDatabase();
  const updatedAt = new Date().toISOString();

  await db.runAsync(
    `UPDATE schedule_entries
     SET shiftCode = ?, shiftLabel = ?, shiftNumber = ?, hours = ?, updatedAt = ?
     WHERE id = ?`,
    shiftCode,
    getShiftLabel(shiftCode),
    getShiftNumber(shiftCode),
    getShiftHours(shiftCode),
    updatedAt,
    entryId
  );
}

export async function clearScheduleWeek(scheduleWeekId: string) {
  const db = await getScheduleDatabase();
  const updatedAt = new Date().toISOString();

  await db.runAsync(
    `UPDATE schedule_entries
     SET shiftCode = '0', shiftLabel = '0', shiftNumber = NULL, hours = 0, updatedAt = ?
     WHERE scheduleWeekId = ?`,
    updatedAt,
    scheduleWeekId
  );
}

export async function clearScheduleDay(scheduleWeekId: string, entryDate: string) {
  const db = await getScheduleDatabase();
  const updatedAt = new Date().toISOString();

  await db.runAsync(
    `UPDATE schedule_entries
     SET shiftCode = '0', shiftLabel = '0', shiftNumber = NULL, hours = 0, updatedAt = ?
     WHERE scheduleWeekId = ? AND entryDate = ?`,
    updatedAt,
    scheduleWeekId,
    entryDate
  );
}

export async function clearEmployeeSchedule(scheduleWeekId: string, employeeId: string) {
  const db = await getScheduleDatabase();
  const updatedAt = new Date().toISOString();

  await db.runAsync(
    `UPDATE schedule_entries
     SET shiftCode = '0', shiftLabel = '0', shiftNumber = NULL, hours = 0, updatedAt = ?
     WHERE scheduleWeekId = ? AND employeeId = ?`,
    updatedAt,
    scheduleWeekId,
    employeeId
  );
}

export async function deleteScheduleWeek(scheduleWeekId: string) {
  const db = await getScheduleDatabase();

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM schedule_entries WHERE scheduleWeekId = ?', scheduleWeekId);
    await db.runAsync('DELETE FROM schedule_weeks WHERE id = ?', scheduleWeekId);
  });
}

export async function copyPreviousWeekSchedule(targetScheduleWeekId: string) {
  const db = await getScheduleDatabase();
  const targetWeek = await getScheduleWeekById(targetScheduleWeekId);

  if (!targetWeek) {
    return false;
  }

  const previousRange = getPreviousRange(targetWeek);
  const previousWeek = await getScheduleWeekByRange(previousRange);

  if (!previousWeek) {
    return false;
  }

  const targetDates = getDateRange(targetWeek.startDate, targetWeek.endDate);
  const [sourceEntries, targetEntries] = await Promise.all([
    db.getAllAsync<ScheduleEntryRow>(
      `SELECT source.*
       FROM schedule_entries source
       JOIN employees e ON e.id = source.employeeId
       WHERE source.scheduleWeekId = ? AND e.isActive = 1`,
      previousWeek.id
    ),
    db.getAllAsync<ScheduleEntryRow>(
      `SELECT target.*
       FROM schedule_entries target
       JOIN employees e ON e.id = target.employeeId
       WHERE target.scheduleWeekId = ? AND e.isActive = 1`,
      targetWeek.id
    ),
  ]);
  const sourceByEmployeeAndDate = new Map(
    sourceEntries.map((entry) => [`${entry.employeeId}:${entry.entryDate}`, entry])
  );
  const updatedAt = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    for (const targetEntry of targetEntries) {
      const previousDate = addDays(targetEntry.entryDate, -targetDates.length);
      const sourceEntry = sourceByEmployeeAndDate.get(`${targetEntry.employeeId}:${previousDate}`);

      if (!sourceEntry) {
        continue;
      }

      await db.runAsync(
        `UPDATE schedule_entries
         SET shiftCode = ?, shiftLabel = ?, shiftNumber = ?, hours = ?, updatedAt = ?
         WHERE id = ?`,
        sourceEntry.shiftCode,
        sourceEntry.shiftLabel,
        sourceEntry.shiftNumber,
        sourceEntry.hours,
        updatedAt,
        targetEntry.id
      );
    }
  });

  return true;
}

export async function deleteSchedulesOlderThan(date: string) {
  const db = await getScheduleDatabase();
  const oldWeeks = await db.getAllAsync<Pick<ScheduleWeek, 'id'>>(
    'SELECT id FROM schedule_weeks WHERE endDate < ?',
    date
  );

  await db.withTransactionAsync(async () => {
    for (const week of oldWeeks) {
      await db.runAsync('DELETE FROM schedule_entries WHERE scheduleWeekId = ?', week.id);
      await db.runAsync('DELETE FROM schedule_weeks WHERE id = ?', week.id);
    }
  });

  return oldWeeks.length;
}

export async function getSetting(key: string) {
  const db = await getScheduleDatabase();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM app_settings WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string) {
  const db = await getScheduleDatabase();
  await db.runAsync(
    `INSERT INTO app_settings (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    key,
    value
  );
}

export async function getTodayShiftSummary(date: string) {
  const db = await getScheduleDatabase();
  return db.getAllAsync<{ shiftNumber: number; peopleCount: number; hours: number }>(
    `SELECT shiftNumber, COUNT(*) as peopleCount, SUM(hours) as hours
     FROM schedule_entries
     WHERE entryDate = ? AND shiftNumber IS NOT NULL AND hours > 0
     GROUP BY shiftNumber
     ORDER BY shiftNumber ASC`,
    date
  );
}
