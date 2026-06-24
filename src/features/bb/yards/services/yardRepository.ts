import { Yard, YardInput, YardRow, YardWithStats } from '../types/yardTypes';
import { getBbDatabase } from '../../services/bbRepository';

export async function getYards() {
  const db = await getBbDatabase();
  const rows = await db.getAllAsync<YardRow & { activeBbCount: number }>(
    `SELECT y.*, COUNT(br.id) as activeBbCount
     FROM yards y
     LEFT JOIN bb_records br ON br.placId = y.id AND br.status = 'active'
     GROUP BY y.id
     ORDER BY y.name COLLATE NOCASE ASC`
  );

  return rows.map<YardWithStats>((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    activeBbCount: row.activeBbCount,
  }));
}

export async function getYardById(id: string) {
  const db = await getBbDatabase();
  return db.getFirstAsync<YardRow>('SELECT * FROM yards WHERE id = ?', id);
}

export async function findYardByName(name: string) {
  const db = await getBbDatabase();
  return db.getFirstAsync<YardRow>('SELECT * FROM yards WHERE lower(name) = lower(?)', name);
}

export async function createYard(yard: Yard) {
  const db = await getBbDatabase();
  await db.runAsync(
    'INSERT INTO yards (id, name, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
    yard.id,
    yard.name,
    yard.description,
    yard.createdAt,
    yard.updatedAt
  );

  return yard;
}

export async function updateYard(id: string, input: YardInput & { updatedAt: string }) {
  const db = await getBbDatabase();
  await db.runAsync(
    'UPDATE yards SET name = ?, description = ?, updatedAt = ? WHERE id = ?',
    input.name,
    input.description ?? null,
    input.updatedAt,
    id
  );

  return getYardById(id);
}

export async function deleteYard(id: string) {
  const db = await getBbDatabase();
  await db.runAsync('DELETE FROM yards WHERE id = ?', id);
}

export async function getActiveBbCountForYard(placId: string) {
  const db = await getBbDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM bb_records WHERE placId = ? AND status = 'active'",
    placId
  );

  return row?.count ?? 0;
}

export async function canDeleteYard(placId: string) {
  return (await getActiveBbCountForYard(placId)) === 0;
}
