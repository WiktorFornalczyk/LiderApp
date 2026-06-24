import * as SQLite from 'expo-sqlite';

import { runBbAndYardsMigration } from '../database/migrations/bbAndYardsMigration';
import {
  BbBackupData,
  BbFilters,
  BbInput,
  BbRecord,
  BbRecordRow,
  BbRecordWithYard,
  BbSortMode,
  BbStatus,
} from '../types/bbTypes';
import { YardRow } from '../yards/types/yardTypes';
import { rangesOverlap } from '../utils/bbRangeUtils';

const DATABASE_NAME = 'liderapp.db';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getBbDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await runBbAndYardsMigration(db);
      return db;
    });
  }

  return databasePromise;
}

export function mapBbRow(row: BbRecordRow): BbRecord {
  return {
    ...row,
    linia: row.linia === 'L-II' ? 'L-II' : 'L-I',
    paleta: row.paleta === 'drewniana' || row.paleta === 'plastikowa' ? row.paleta : null,
    strecz: row.strecz === 1,
    kapturownica: row.kapturownica === 1,
    status: row.status as BbStatus,
  };
}

function mapBbWithYardRow(row: BbRecordRow & YardRow & { yardId: string; yardCreatedAt: string; yardUpdatedAt: string }): BbRecordWithYard {
  return {
    ...mapBbRow(row),
    yard: {
      id: row.yardId,
      name: row.name,
      description: row.description,
      createdAt: row.yardCreatedAt,
      updatedAt: row.yardUpdatedAt,
    },
  };
}

function selectBbWithYard(where: string) {
  return `SELECT br.*, y.id as yardId, y.name, y.description, y.createdAt as yardCreatedAt, y.updatedAt as yardUpdatedAt
    FROM bb_records br
    JOIN yards y ON y.id = br.placId
    ${where}`;
}

function getOrderBy(sortMode: BbSortMode = 'newest') {
  if (sortMode === 'oldest') return 'br.createdAt ASC';
  if (sortMode === 'nrPartii') return 'br.nrPartii ASC, br.bbOd ASC';
  if (sortMode === 'yard') return 'y.name COLLATE NOCASE ASC, br.nrPartii ASC';
  if (sortMode === 'range') return 'br.bbOd ASC, br.bbDo ASC';
  if (sortMode === 'rodzajSadzy') return 'br.rodzajSadzy COLLATE NOCASE ASC';
  return 'br.createdAt DESC';
}

export async function getActiveBbRecords(sortMode: BbSortMode = 'newest') {
  const db = await getBbDatabase();
  const rows = await db.getAllAsync<BbRecordRow & YardRow & { yardId: string; yardCreatedAt: string; yardUpdatedAt: string }>(
    `${selectBbWithYard("WHERE br.status = 'active'")} ORDER BY ${getOrderBy(sortMode)}`
  );

  return rows.map(mapBbWithYardRow);
}

export async function getArchivedBbRecords() {
  const db = await getBbDatabase();
  const rows = await db.getAllAsync<BbRecordRow & YardRow & { yardId: string; yardCreatedAt: string; yardUpdatedAt: string }>(
    `${selectBbWithYard("WHERE br.status = 'archived'")} ORDER BY br.archivedAt DESC`
  );

  return rows.map(mapBbWithYardRow);
}

export async function getBbRecordById(id: string) {
  const db = await getBbDatabase();
  const row = await db.getFirstAsync<BbRecordRow & YardRow & { yardId: string; yardCreatedAt: string; yardUpdatedAt: string }>(
    `${selectBbWithYard('WHERE br.id = ?')}`,
    id
  );

  return row ? mapBbWithYardRow(row) : null;
}

export async function getBbRecordsByYard(placId: string) {
  const db = await getBbDatabase();
  const rows = await db.getAllAsync<BbRecordRow & YardRow & { yardId: string; yardCreatedAt: string; yardUpdatedAt: string }>(
    `${selectBbWithYard("WHERE br.placId = ? AND br.status = 'active'")} ORDER BY br.nrPartii ASC, br.bbOd ASC`,
    placId
  );

  return rows.map(mapBbWithYardRow);
}

export async function createBbRecord(record: BbRecord) {
  const db = await getBbDatabase();
  await db.runAsync(
    `INSERT INTO bb_records (
      id, placId, nrPartii, rodzajSadzy, bbOd, bbDo, linia, paleta, strecz, kapturownica,
      uwagi, status, archivedAt, parentId, splitFromId, splitAt, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    record.id,
    record.placId,
    record.nrPartii,
    record.rodzajSadzy,
    record.bbOd,
    record.bbDo,
    record.linia,
    record.paleta,
    record.strecz ? 1 : 0,
    record.kapturownica ? 1 : 0,
    record.uwagi,
    record.status,
    record.archivedAt,
    record.parentId,
    record.splitFromId,
    record.splitAt,
    record.createdAt,
    record.updatedAt
  );

  return record;
}

export async function updateBbRecord(id: string, input: BbInput & { updatedAt: string }) {
  const db = await getBbDatabase();
  await db.runAsync(
    `UPDATE bb_records
     SET placId = ?, nrPartii = ?, rodzajSadzy = ?, bbOd = ?, bbDo = ?, linia = ?, paleta = ?,
         strecz = ?, kapturownica = ?, uwagi = ?, updatedAt = ?
     WHERE id = ?`,
    input.placId,
    input.nrPartii,
    input.rodzajSadzy,
    Number(input.bbOd),
    Number(input.bbDo),
    input.linia,
    input.paleta ?? null,
    input.strecz ? 1 : 0,
    input.kapturownica ? 1 : 0,
    input.uwagi ?? null,
    input.updatedAt,
    id
  );

  return getBbRecordById(id);
}

export async function archiveBbRecord(id: string) {
  const db = await getBbDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE bb_records SET status = 'archived', archivedAt = ?, updatedAt = ? WHERE id = ?`,
    now,
    now,
    id
  );
}

export async function restoreBbRecord(id: string) {
  const db = await getBbDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE bb_records SET status = 'active', archivedAt = NULL, updatedAt = ? WHERE id = ?`,
    now,
    id
  );
}

export async function permanentlyDeleteBbRecord(id: string) {
  const db = await getBbDatabase();
  await db.runAsync('DELETE FROM bb_records WHERE id = ?', id);
}

export async function permanentlyDeleteExpiredArchivedBbRecords(beforeDate: string) {
  const db = await getBbDatabase();
  const rows = await db.getAllAsync<{ id: string }>(
    `SELECT id FROM bb_records WHERE status = 'archived' AND archivedAt < ?`,
    beforeDate
  );

  await db.withTransactionAsync(async () => {
    for (const row of rows) {
      await db.runAsync('DELETE FROM bb_records WHERE id = ?', row.id);
    }
  });

  return rows.length;
}

export async function markBbRecordAsSplit(id: string, splitAt: number) {
  const db = await getBbDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE bb_records SET status = 'split', splitAt = ?, updatedAt = ? WHERE id = ?`,
    splitAt,
    now,
    id
  );
}

export async function searchBbRecords(query: string) {
  const db = await getBbDatabase();
  const value = `%${query.trim().toLowerCase()}%`;
  const rows = await db.getAllAsync<BbRecordRow & YardRow & { yardId: string; yardCreatedAt: string; yardUpdatedAt: string }>(
    `${selectBbWithYard(`
      WHERE br.status = 'active'
        AND (
          lower(br.nrPartii) LIKE ?
          OR lower(br.rodzajSadzy) LIKE ?
          OR lower(y.name) LIKE ?
          OR lower(br.linia) LIKE ?
          OR CAST(br.bbOd AS TEXT) LIKE ?
          OR CAST(br.bbDo AS TEXT) LIKE ?
        )
    `)} ORDER BY br.updatedAt DESC`,
    value,
    value,
    value,
    value,
    value,
    value
  );

  return rows.map(mapBbWithYardRow);
}

export async function filterBbRecords(filters: BbFilters, sortMode: BbSortMode = 'newest') {
  const records = await getActiveBbRecords(sortMode);

  return records.filter((record) => {
    if (filters.placId && record.placId !== filters.placId) return false;
    if (filters.nrPartii && !record.nrPartii.includes(filters.nrPartii.trim())) return false;
    if (filters.rodzajSadzy && !record.rodzajSadzy.toLowerCase().includes(filters.rodzajSadzy.trim().toLowerCase())) return false;
    if (filters.linia && record.linia !== filters.linia) return false;
    if (filters.paleta === 'empty' && record.paleta !== null) return false;
    if (filters.paleta && filters.paleta !== 'empty' && record.paleta !== filters.paleta) return false;
    if (filters.strecz !== null && filters.strecz !== undefined && record.strecz !== filters.strecz) return false;
    if (filters.kapturownica !== null && filters.kapturownica !== undefined && record.kapturownica !== filters.kapturownica) return false;
    if (filters.createdAtFrom && record.createdAt < filters.createdAtFrom) return false;
    if (filters.updatedAtFrom && record.updatedAt < filters.updatedAtFrom) return false;
    return true;
  });
}

export async function findDuplicateBbRecord(input: { nrPartii: string; bbOd: number; bbDo: number; ignoredId?: string }) {
  const db = await getBbDatabase();
  const rows = await db.getAllAsync<BbRecordRow & YardRow & { yardId: string; yardCreatedAt: string; yardUpdatedAt: string }>(
    `${selectBbWithYard("WHERE br.status = 'active' AND br.nrPartii = ? AND br.bbOd = ? AND br.bbDo = ?")}`,
    input.nrPartii,
    input.bbOd,
    input.bbDo
  );

  return rows.map(mapBbWithYardRow).find((record) => record.id !== input.ignoredId) ?? null;
}

export async function findOverlappingBbRanges(input: { nrPartii: string; bbOd: number; bbDo: number; ignoredId?: string }) {
  const db = await getBbDatabase();
  const rows = await db.getAllAsync<BbRecordRow & YardRow & { yardId: string; yardCreatedAt: string; yardUpdatedAt: string }>(
    `${selectBbWithYard("WHERE br.status = 'active' AND br.nrPartii = ?")}`,
    input.nrPartii
  );

  return rows
    .map(mapBbWithYardRow)
    .filter((record) => record.id !== input.ignoredId && rangesOverlap(record, input));
}

export async function getRecentlyUsedCarbonTypes() {
  const db = await getBbDatabase();
  const rows = await db.getAllAsync<{ rodzajSadzy: string }>(
    `SELECT rodzajSadzy FROM bb_records
     WHERE status = 'active'
     GROUP BY rodzajSadzy
     ORDER BY MAX(updatedAt) DESC
     LIMIT 8`
  );

  return rows.map((row) => row.rodzajSadzy);
}

export async function getBbRecordsForExport(options?: { includeArchived?: boolean }) {
  const db = await getBbDatabase();
  const statusWhere = options?.includeArchived
    ? "WHERE br.status IN ('active', 'archived')"
    : "WHERE br.status = 'active'";
  const rows = await db.getAllAsync<BbRecordRow & YardRow & { yardId: string; yardCreatedAt: string; yardUpdatedAt: string }>(
    `${selectBbWithYard(statusWhere)} ORDER BY br.createdAt DESC`
  );

  return rows.map(mapBbWithYardRow);
}

export async function getBbCounts() {
  const db = await getBbDatabase();
  const active = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM bb_records WHERE status = 'active'");
  const archived = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM bb_records WHERE status = 'archived'");
  const yards = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM yards');

  return {
    active: active?.count ?? 0,
    archived: archived?.count ?? 0,
    yards: yards?.count ?? 0,
  };
}

export async function getRecentBbRecords(limit = 3) {
  const records = await getActiveBbRecords('newest');
  return records.slice(0, limit);
}

export async function getSetting(key: string) {
  const db = await getBbDatabase();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM app_settings WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string) {
  const db = await getBbDatabase();
  await db.runAsync(
    `INSERT INTO app_settings (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    key,
    value
  );
}

export async function replaceBbBackupData(data: BbBackupData) {
  const db = await getBbDatabase();

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM bb_records');
    await db.runAsync('DELETE FROM yards');

    for (const yard of data.yards) {
      await db.runAsync(
        `INSERT INTO yards (id, name, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
        yard.id,
        yard.name,
        yard.description,
        yard.createdAt,
        yard.updatedAt
      );
    }

    for (const record of data.bbRecords) {
      await createBbRecord(record);
    }
  });
}

export async function mergeBbBackupData(data: BbBackupData) {
  const db = await getBbDatabase();
  const summary = { added: 0, updated: 0, skipped: 0, conflicts: 0 };

  await db.withTransactionAsync(async () => {
    for (const yard of data.yards) {
      const existing = await db.getFirstAsync<YardRow>('SELECT * FROM yards WHERE id = ?', yard.id);
      if (existing) {
        await db.runAsync(
          'UPDATE yards SET name = ?, description = ?, updatedAt = ? WHERE id = ?',
          yard.name,
          yard.description,
          yard.updatedAt,
          yard.id
        );
        summary.updated += 1;
      } else {
        await db.runAsync(
          `INSERT INTO yards (id, name, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
          yard.id,
          yard.name,
          yard.description,
          yard.createdAt,
          yard.updatedAt
        );
        summary.added += 1;
      }
    }

    for (const record of data.bbRecords) {
      const existing = await db.getFirstAsync<BbRecordRow>('SELECT * FROM bb_records WHERE id = ?', record.id);
      if (existing) {
        await db.runAsync(
          `UPDATE bb_records
           SET placId = ?, nrPartii = ?, rodzajSadzy = ?, bbOd = ?, bbDo = ?, linia = ?, paleta = ?,
               strecz = ?, kapturownica = ?, uwagi = ?, status = ?, archivedAt = ?, parentId = ?,
               splitFromId = ?, splitAt = ?, updatedAt = ?
           WHERE id = ?`,
          record.placId,
          record.nrPartii,
          record.rodzajSadzy,
          record.bbOd,
          record.bbDo,
          record.linia,
          record.paleta,
          record.strecz ? 1 : 0,
          record.kapturownica ? 1 : 0,
          record.uwagi,
          record.status,
          record.archivedAt,
          record.parentId,
          record.splitFromId,
          record.splitAt,
          record.updatedAt,
          record.id
        );
        summary.updated += 1;
      } else {
        await createBbRecord(record);
        summary.added += 1;
      }
    }
  });

  return summary;
}
