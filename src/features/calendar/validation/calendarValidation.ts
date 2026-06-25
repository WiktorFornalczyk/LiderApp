import { CalendarEventInput, CalendarEventValidationErrors, calendarEventTypes } from '../types/calendarTypes';
import { isValidDateKey, isValidTime } from '../utils/calendarDateUtils';

export const calendarErrorMessages = {
  titleRequired: 'Podaj tytuł wydarzenia.',
  titleTooLong: 'Tytuł wydarzenia może mieć maksymalnie 100 znaków.',
  dateRequired: 'Podaj datę wydarzenia.',
  dateInvalid: 'Podaj poprawną datę.',
  timeInvalid: 'Podaj godzinę w formacie HH:mm.',
  descriptionTooLong: 'Opis może mieć maksymalnie 1000 znaków.',
  saveFailed: 'Nie udało się zapisać wydarzenia.',
  deleteFailed: 'Nie udało się usunąć wydarzenia.',
  loadFailed: 'Nie udało się wczytać wydarzeń.',
  notFound: 'Nie znaleziono wydarzeń.',
};

export function sanitizeCalendarEventInput(input: CalendarEventInput): CalendarEventInput {
  const title = input.title.trim();
  const description = input.description?.trim() || null;
  const eventDate = input.eventDate.trim();
  const eventTime = input.isAllDay ? null : input.eventTime?.trim() || null;
  const eventType = input.eventType && calendarEventTypes.includes(input.eventType) ? input.eventType : 'Inne';

  return {
    title,
    description,
    eventDate,
    eventTime,
    eventType,
    isAllDay: input.isAllDay,
  };
}

export function validateCalendarEventInput(input: CalendarEventInput): CalendarEventValidationErrors {
  const errors: CalendarEventValidationErrors = {};

  if (!input.title.trim()) {
    errors.title = calendarErrorMessages.titleRequired;
  } else if (input.title.trim().length > 100) {
    errors.title = calendarErrorMessages.titleTooLong;
  }

  if (!input.eventDate.trim()) {
    errors.eventDate = calendarErrorMessages.dateRequired;
  } else if (!isValidDateKey(input.eventDate.trim())) {
    errors.eventDate = calendarErrorMessages.dateInvalid;
  }

  if (!input.isAllDay && input.eventTime?.trim() && !isValidTime(input.eventTime.trim())) {
    errors.eventTime = calendarErrorMessages.timeInvalid;
  }

  if (input.description && input.description.trim().length > 1000) {
    errors.description = calendarErrorMessages.descriptionTooLong;
  }

  return errors;
}

export function hasCalendarValidationErrors(errors: CalendarEventValidationErrors) {
  return Object.values(errors).some(Boolean);
}
