import { ShiftCode, ShiftOption } from '../types/scheduleTypes';

const shiftOptions: ShiftOption[] = [
  {
    code: '0',
    label: '0',
    shortLabel: '0',
    description: 'Wolne, 0 godzin',
    shiftNumber: null,
    hours: 0,
  },
  {
    code: '1',
    label: '1',
    shortLabel: '1',
    description: 'Zmiana 1, 8 godzin',
    shiftNumber: 1,
    hours: 8,
  },
  {
    code: '2',
    label: '2',
    shortLabel: '2',
    description: 'Zmiana 2, 8 godzin',
    shiftNumber: 2,
    hours: 8,
  },
  {
    code: '3',
    label: '3',
    shortLabel: '3',
    description: 'Zmiana 3, 8 godzin',
    shiftNumber: 3,
    hours: 8,
  },
  {
    code: '1_8_16',
    label: '1 (8-16)',
    shortLabel: '1',
    description: 'Zmiana 1, 8:00-16:00, 8 godzin',
    shiftNumber: 1,
    hours: 8,
  },
  {
    code: '1_12H',
    label: '1 12h',
    shortLabel: '1 12h',
    description: 'Zmiana 1, 12 godzin',
    shiftNumber: 1,
    hours: 12,
  },
  {
    code: '2_12H',
    label: '2 12h',
    shortLabel: '2 12h',
    description: 'Zmiana 2, 12 godzin',
    shiftNumber: 2,
    hours: 12,
  },
  {
    code: 'U',
    label: 'U',
    shortLabel: 'U',
    description: 'Urlop, 0 godzin',
    shiftNumber: null,
    hours: 0,
  },
  {
    code: 'L4',
    label: 'L4',
    shortLabel: 'L4',
    description: 'Zwolnienie lekarskie, 0 godzin',
    shiftNumber: null,
    hours: 0,
  },
];

export function getAllShiftOptions() {
  return shiftOptions;
}

export function isShiftCode(value: string): value is ShiftCode {
  return shiftOptions.some((option) => option.code === value);
}

function findShift(shiftCode: string) {
  return shiftOptions.find((option) => option.code === shiftCode) ?? shiftOptions[0];
}

export function getShiftNumber(shiftCode: string) {
  return findShift(shiftCode).shiftNumber;
}

export function getShiftHours(shiftCode: string) {
  return findShift(shiftCode).hours;
}

export function getShiftLabel(shiftCode: string) {
  return findShift(shiftCode).label;
}

export function getShiftShortLabel(shiftCode: string) {
  return findShift(shiftCode).shortLabel;
}

export function getShiftDescription(shiftCode: string) {
  return findShift(shiftCode).description;
}

export function isWorkingShift(shiftCode: string) {
  return getShiftHours(shiftCode) > 0;
}
