import { BbRecord } from '../types/bbTypes';
import { canSplitRange } from '../utils/bbRangeUtils';
import { bbErrorMessages } from '../validation/bbValidation';
import { getBbDatabase, getBbRecordById } from './bbRepository';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function childRecord(original: BbRecord, bbOd: number, bbDo: number): BbRecord {
  const now = new Date().toISOString();

  return {
    ...original,
    id: createId(),
    bbOd,
    bbDo,
    status: 'active',
    archivedAt: null,
    parentId: original.id,
    splitFromId: original.id,
    splitAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function splitBbRecord(recordId: string, splitAfterNumber: number) {
  const original = await getBbRecordById(recordId);

  if (!original || original.status !== 'active') {
    throw new Error(bbErrorMessages.splitFailed);
  }

  if (!canSplitRange(original, splitAfterNumber)) {
    throw new Error(bbErrorMessages.splitFailed);
  }

  const db = await getBbDatabase();
  const first = childRecord(original, original.bbOd, splitAfterNumber);
  const second = childRecord(original, splitAfterNumber + 1, original.bbDo);
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE bb_records SET status = 'split', splitAt = ?, updatedAt = ? WHERE id = ?`,
      splitAfterNumber,
      now,
      original.id
    );

    for (const record of [first, second]) {
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
    }
  });

  return [first, second];
}
