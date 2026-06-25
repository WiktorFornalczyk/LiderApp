import { addDays, getTodayDate } from '../utils/dateRangeUtils';
import * as scheduleRepository from './scheduleRepository';

const LAST_CLEANUP_KEY = 'lastScheduleCleanupAt';
const RETENTION_DAYS_KEY = 'scheduleRetentionDays';
const DEFAULT_RETENTION_DAYS = 28;

function normalizeRetentionDays(value: string | null) {
  const days = Number(value);

  if (!Number.isInteger(days) || days < 1 || days > 365) {
    return DEFAULT_RETENTION_DAYS;
  }

  return days;
}

export async function getScheduleRetentionDays() {
  return normalizeRetentionDays(await scheduleRepository.getSetting(RETENTION_DAYS_KEY));
}

export async function setScheduleRetentionDays(days: number) {
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    throw new Error('Podaj liczbę dni od 1 do 365.');
  }

  await scheduleRepository.setSetting(RETENTION_DAYS_KEY, String(days));
  return days;
}

export async function cleanupOldSchedules() {
  try {
    const today = getTodayDate();
    const lastCleanupAt = await scheduleRepository.getSetting(LAST_CLEANUP_KEY);

    if (lastCleanupAt?.slice(0, 10) === today) {
      return { deletedCount: 0, skipped: true, lastCleanupAt };
    }

    const retentionDays = await getScheduleRetentionDays();
    const cutoffDate = addDays(today, -retentionDays);
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
