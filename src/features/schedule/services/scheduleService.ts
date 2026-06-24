import { ScheduleEntry, ScheduleWeek, ScheduleWeekInput, ShiftCode } from '../types/scheduleTypes';
import {
  addDays,
  getDateRange,
  getDefaultWeekRange,
  getTodayDate,
  shiftRangeByDays,
} from '../utils/dateRangeUtils';
import { getShiftHours, getShiftLabel, getShiftNumber, isShiftCode } from '../utils/shiftUtils';
import {
  hasScheduleValidationErrors,
  scheduleErrorMessages,
  validateScheduleRange,
  validateShiftCode,
} from '../validation/scheduleValidation';
import * as employeeRepository from './employeeRepository';
import * as scheduleRepository from './scheduleRepository';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function buildEntry(scheduleWeekId: string, employeeId: string, entryDate: string): ScheduleEntry {
  const now = new Date().toISOString();

  return {
    id: createId(),
    scheduleWeekId,
    employeeId,
    entryDate,
    shiftCode: '0',
    shiftLabel: getShiftLabel('0'),
    shiftNumber: getShiftNumber('0'),
    hours: getShiftHours('0'),
    createdAt: now,
    updatedAt: now,
  };
}

export function getCurrentWeekRange() {
  return getDefaultWeekRange();
}

export function getNextRange(range: ScheduleWeekInput) {
  return shiftRangeByDays(range, getDateRange(range.startDate, range.endDate).length);
}

export function getPreviousRange(range: ScheduleWeekInput) {
  return shiftRangeByDays(range, -getDateRange(range.startDate, range.endDate).length);
}

export async function getScheduleWeeks() {
  return scheduleRepository.getScheduleWeeks();
}

export async function getScheduleWeekByDate(date = getTodayDate()) {
  return scheduleRepository.getScheduleWeekByDate(date);
}

export async function getScheduleEditorData(scheduleWeekId: string) {
  const week = await scheduleRepository.getScheduleWeekById(scheduleWeekId);

  if (!week) {
    throw new Error(scheduleErrorMessages.loadFailed);
  }

  return {
    week,
    entries: await scheduleRepository.getScheduleEntriesWithEmployees(scheduleWeekId),
    dates: getDateRange(week.startDate, week.endDate),
  };
}

export async function createScheduleWeek(input: ScheduleWeekInput, options?: { allowDuplicate?: boolean }) {
  const errors = validateScheduleRange(input);

  if (hasScheduleValidationErrors(errors)) {
    throw new Error(Object.values(errors)[0] ?? scheduleErrorMessages.invalidRange);
  }

  const duplicate = await scheduleRepository.getScheduleWeekByRange(input);

  if (duplicate && !options?.allowDuplicate) {
    throw new Error(scheduleErrorMessages.duplicateRange);
  }

  const employees = await employeeRepository.getActiveEmployees();
  const now = new Date().toISOString();
  const week: ScheduleWeek = {
    id: createId(),
    startDate: input.startDate,
    endDate: input.endDate,
    createdAt: now,
    updatedAt: now,
  };
  const dates = getDateRange(input.startDate, input.endDate);
  const entries = employees.flatMap((employee) =>
    dates.map((date) => buildEntry(week.id, employee.id, date))
  );

  await scheduleRepository.createScheduleWeek(week);
  await scheduleRepository.createScheduleEntries(entries);

  return week;
}

export async function updateScheduleEntry(entryId: string, shiftCode: string) {
  const errors = validateShiftCode(shiftCode);

  if (hasScheduleValidationErrors(errors) || !isShiftCode(shiftCode)) {
    throw new Error(scheduleErrorMessages.updateFailed);
  }

  return scheduleRepository.updateScheduleEntry(entryId, shiftCode);
}

export async function clearScheduleWeek(scheduleWeekId: string) {
  return scheduleRepository.clearScheduleWeek(scheduleWeekId);
}

export async function clearScheduleDay(scheduleWeekId: string, entryDate: string) {
  return scheduleRepository.clearScheduleDay(scheduleWeekId, entryDate);
}

export async function clearEmployeeSchedule(scheduleWeekId: string, employeeId: string) {
  return scheduleRepository.clearEmployeeSchedule(scheduleWeekId, employeeId);
}

export async function deleteScheduleWeek(scheduleWeekId: string) {
  return scheduleRepository.deleteScheduleWeek(scheduleWeekId);
}

export async function copyPreviousWeekSchedule(targetScheduleWeekId: string) {
  const copied = await scheduleRepository.copyPreviousWeekSchedule(targetScheduleWeekId);

  if (!copied) {
    throw new Error('Nie znaleziono grafiku z poprzedniego tygodnia.');
  }
}

export async function getScheduleEntriesForDates(dates: string[]) {
  return scheduleRepository.getScheduleEntriesForDates(dates);
}

export async function getDashboardScheduleSummary() {
  const today = getTodayDate();
  const [currentWeek, activeEmployeesCount, todayShiftSummary] = await Promise.all([
    scheduleRepository.getScheduleWeekByDate(today),
    employeeRepository.getActiveEmployeesCount(),
    scheduleRepository.getTodayShiftSummary(today),
  ]);

  return {
    currentWeek,
    activeEmployeesCount,
    todayShiftSummary,
  };
}

export function getEntryDatePlusDays(entryDate: string, days: number) {
  return addDays(entryDate, days);
}

export function normalizeShiftCode(shiftCode: string): ShiftCode {
  return isShiftCode(shiftCode) ? shiftCode : '0';
}
