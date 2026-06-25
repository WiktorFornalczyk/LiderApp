import { CalendarEvent, CalendarEventInput, CalendarFiltersState } from '../types/calendarTypes';
import {
  calendarErrorMessages,
  hasCalendarValidationErrors,
  sanitizeCalendarEventInput,
  validateCalendarEventInput,
} from '../validation/calendarValidation';
import * as calendarRepository from './calendarRepository';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function validateEvent(input: CalendarEventInput) {
  return validateCalendarEventInput(input);
}

export async function getEvents(filters: CalendarFiltersState) {
  return calendarRepository.filterEvents(filters);
}

export async function getEventById(id: string) {
  return calendarRepository.getEventById(id);
}

export async function getEventsByDate(date: string) {
  return calendarRepository.getEventsByDate(date);
}

export async function getEventsByDateRange(startDate: string, endDate: string) {
  return calendarRepository.getEventsByDateRange(startDate, endDate);
}

export async function getDashboardCalendarSummary() {
  const [todayEvents, upcomingEvents] = await Promise.all([
    calendarRepository.getTodayEvents(),
    calendarRepository.getUpcomingEvents(4),
  ]);

  return {
    todayEvents,
    upcomingEvents,
    todayCount: todayEvents.length,
    nextEvent: upcomingEvents[0] ?? null,
  };
}

export async function createEvent(input: CalendarEventInput) {
  const sanitizedInput = sanitizeCalendarEventInput(input);
  const errors = validateCalendarEventInput(sanitizedInput);

  if (hasCalendarValidationErrors(errors)) {
    throw new Error(Object.values(errors)[0] ?? calendarErrorMessages.saveFailed);
  }

  const now = new Date().toISOString();
  const event: CalendarEvent = {
    id: createId(),
    title: sanitizedInput.title,
    description: sanitizedInput.description ?? null,
    eventDate: sanitizedInput.eventDate,
    eventTime: sanitizedInput.isAllDay ? null : sanitizedInput.eventTime ?? null,
    eventType: sanitizedInput.eventType ?? 'Inne',
    isAllDay: sanitizedInput.isAllDay,
    createdAt: now,
    updatedAt: now,
  };

  return calendarRepository.createEvent(event);
}

export async function updateEvent(id: string, input: CalendarEventInput) {
  const sanitizedInput = sanitizeCalendarEventInput(input);
  const errors = validateCalendarEventInput(sanitizedInput);

  if (hasCalendarValidationErrors(errors)) {
    throw new Error(Object.values(errors)[0] ?? calendarErrorMessages.saveFailed);
  }

  return calendarRepository.updateEvent(id, {
    ...sanitizedInput,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteEvent(id: string) {
  return calendarRepository.deleteEvent(id);
}
