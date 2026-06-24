import { addDays, getTodayDate } from '../utils/dateRangeUtils';
import * as scheduleRepository from './scheduleRepository';

const LAST_CLEANUP_KEY = 'lastScheduleCleanupAt';

export async function cleanupOldSchedules() {
  try {
    const today = getTodayDate();
    const lastCleanupAt = await scheduleRepository.getSetting(LAST_CLEANUP_KEY);

    if (lastCleanupAt?.slice(0, 10) === today) {
      return { deletedCount: 0, skipped: true, lastCleanupAt };
    }

    const cutoffDate = addDays(today, -28);
    const deletedCount = await scheduleRepository.deleteSchedulesOlderThan(cutoffDate);
    const cleanedAt = new Date().toISOString();
    await scheduleRepository.setSetting(LAST_CLEANUP_KEY, cleanedAt);

    return { deletedCount, skipped: false, lastCleanupAt: cleanedAt };
  } catch {
    return { deletedCount: 0, skipped: false, lastCleanupAt: null, error: true };
  }
}

export async function getLastScheduleCleanupAt() {
  return scheduleRepository.getSetting(LAST_CLEANUP_KEY);
}
