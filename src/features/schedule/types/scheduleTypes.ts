import { Employee } from './employeeTypes';

export type ShiftCode = '0' | '1' | '2' | '3' | '1_8_16' | '1_12H' | '2_12H' | 'U' | 'L4';

export type ShiftOption = {
  code: ShiftCode;
  label: string;
  shortLabel: string;
  description: string;
  shiftNumber: number | null;
  hours: number;
};

export type ScheduleWeek = {
  id: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

export type ScheduleWeekRow = ScheduleWeek;

export type ScheduleEntry = {
  id: string;
  scheduleWeekId: string;
  employeeId: string;
  entryDate: string;
  shiftCode: ShiftCode;
  shiftLabel: string;
  shiftNumber: number | null;
  hours: number;
  createdAt: string;
  updatedAt: string;
};

export type ScheduleEntryRow = Omit<ScheduleEntry, 'shiftCode'> & {
  shiftCode: string;
};

export type ScheduleEntryWithEmployee = ScheduleEntry & {
  employee: Employee;
};

export type ScheduleWeekInput = {
  startDate: string;
  endDate: string;
};

export type ScheduleRange = {
  startDate: string;
  endDate: string;
};

export type ScheduleValidationErrors = Partial<Record<keyof ScheduleWeekInput | 'shiftCode', string>>;

export type DayShiftSummary = {
  entryDate: string;
  shiftNumber: number;
  peopleCount: number;
  hours: number;
};

export type ScheduleEditorData = {
  week: ScheduleWeek;
  entries: ScheduleEntryWithEmployee[];
  dates: string[];
};
