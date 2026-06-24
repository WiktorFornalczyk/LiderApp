import { bbErrorMessages } from '../validation/bbValidation';
import * as bbRepository from './bbRepository';

const LAST_CLEANUP_KEY = 'lastBbArchiveCleanupAt';
const RETENTION_DAYS_KEY = 'bbArchiveRetentionDays';
const DEFAULT_RETENTION_DAYS = 7;
const dayMs = 24 * 60 * 60 * 1000;

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * dayMs);
}

export async function archiveBbRecord(id: string) {
  try {
    return await bbRepository.archiveBbRecord(id);
  } catch {
    throw new Error(bbErrorMessages.archiveFailed);
  }
}

export async function restoreBbRecord(id: string, options?: { allowConflict?: boolean }) {
  const record = await bbRepository.getBbRecordById(id);

  if (!record) {
    throw new Error(bbErrorMessages.restoreFailed);
  }

  const conflicts = await bbRepository.findOverlappingBbRanges({
    nrPartii: record.nrPartii,
    bbOd: record.bbOd,
    bbDo: record.bbDo,
    ignoredId: id,
  });

  if (conflicts.length > 0 && !options?.allowConflict) {
    throw new Error('Przywracany zakres koliduje z aktywnym zapisem tej samej partii.');
  }

  return bbRepository.restoreBbRecord(id);
}

export async function permanentlyDeleteBbRecord(id: string) {
  return bbRepository.permanentlyDeleteBbRecord(id);
}

function normalizeRetentionDays(value: string | null) {
  const days = Number(value);

  if (!Number.isInteger(days) || days < 1 || days > 365) {
    return DEFAULT_RETENTION_DAYS;
  }

  return days;
}

export async function getBbArchiveRetentionDays() {
  return normalizeRetentionDays(await bbRepository.getSetting(RETENTION_DAYS_KEY));
}

export async function setBbArchiveRetentionDays(days: number) {
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    throw new Error('Podaj liczbę dni od 1 do 365.');
  }

  await bbRepository.setSetting(RETENTION_DAYS_KEY, String(days));
  return days;
}

export function getDaysUntilPermanentDelete(archivedAt: string | null, retentionDays = DEFAULT_RETENTION_DAYS) {
  if (!archivedAt) {
    return 0;
  }

  const archivedTime = new Date(archivedAt).getTime();
  const deleteTime = archivedTime + retentionDays * dayMs;
  return Math.max(0, Math.ceil((deleteTime - Date.now()) / dayMs));
}

export async function cleanupExpiredBbArchive() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const lastCleanupAt = await bbRepository.getSetting(LAST_CLEANUP_KEY);

    if (lastCleanupAt?.slice(0, 10) === today) {
      return { deletedCount: 0, skipped: true, lastCleanupAt };
    }

    const retentionDays = await getBbArchiveRetentionDays();
    const beforeDate = addDays(new Date(), -retentionDays).toISOString();
    const deletedCount = await bbRepository.permanentlyDeleteExpiredArchivedBbRecords(beforeDate);
    const cleanedAt = new Date().toISOString();
    await bbRepository.setSetting(LAST_CLEANUP_KEY, cleanedAt);

    return { deletedCount, skipped: false, lastCleanupAt: cleanedAt };
  } catch {
    return { deletedCount: 0, skipped: false, lastCleanupAt: null, error: true };
  }
}

export async function getLastBbArchiveCleanupAt() {
  return bbRepository.getSetting(LAST_CLEANUP_KEY);
}
