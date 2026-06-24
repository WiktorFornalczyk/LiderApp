import { bbErrorMessages } from '../validation/bbValidation';
import * as bbRepository from './bbRepository';

const LAST_CLEANUP_KEY = 'lastBbArchiveCleanupAt';
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

export function getDaysUntilPermanentDelete(archivedAt: string | null) {
  if (!archivedAt) {
    return 0;
  }

  const archivedTime = new Date(archivedAt).getTime();
  const deleteTime = archivedTime + 7 * dayMs;
  return Math.max(0, Math.ceil((deleteTime - Date.now()) / dayMs));
}

export async function cleanupExpiredBbArchive() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const lastCleanupAt = await bbRepository.getSetting(LAST_CLEANUP_KEY);

    if (lastCleanupAt?.slice(0, 10) === today) {
      return { deletedCount: 0, skipped: true, lastCleanupAt };
    }

    const beforeDate = addDays(new Date(), -7).toISOString();
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
