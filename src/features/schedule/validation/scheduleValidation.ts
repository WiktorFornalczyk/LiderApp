import { ScheduleValidationErrors, ScheduleWeekInput } from '../types/scheduleTypes';
import { getDateDifferenceInDays, isIsoDate } from '../utils/dateRangeUtils';
import { isShiftCode } from '../utils/shiftUtils';

export const scheduleErrorMessages = {
  invalidRange: 'Podaj poprawny zakres dat.',
  startAfterEnd: 'Data rozpoczęcia nie może być późniejsza niż data zakończenia.',
  rangeTooLong: 'Zakres grafiku może mieć maksymalnie 14 dni.',
  duplicateRange: 'Grafik dla tego zakresu dat już istnieje.',
  invalidShiftCode: 'Wybierz poprawną zmianę.',
  createFailed: 'Nie udało się utworzyć grafiku.',
  updateFailed: 'Nie udało się zapisać zmiany.',
  loadFailed: 'Nie udało się wczytać grafiku.',
  copyFailed: 'Nie udało się skopiować grafiku z poprzedniego tygodnia.',
  exportFailed: 'Nie udało się wygenerować pliku DOCX.',
};

export function validateScheduleRange(input: ScheduleWeekInput): ScheduleValidationErrors {
  const errors: ScheduleValidationErrors = {};

  if (!isIsoDate(input.startDate) || !isIsoDate(input.endDate)) {
    errors.startDate = scheduleErrorMessages.invalidRange;
    return errors;
  }

  const difference = getDateDifferenceInDays(input.startDate, input.endDate);

  if (difference < 0) {
    errors.endDate = scheduleErrorMessages.startAfterEnd;
  } else if (difference > 13) {
    errors.endDate = scheduleErrorMessages.rangeTooLong;
  }

  return errors;
}

export function validateShiftCode(shiftCode: string): ScheduleValidationErrors {
  return isShiftCode(shiftCode) ? {} : { shiftCode: scheduleErrorMessages.invalidShiftCode };
}

export function hasScheduleValidationErrors(errors: ScheduleValidationErrors) {
  return Object.values(errors).some(Boolean);
}
