import { CalendarEvent } from '../types/calendarTypes';

const monthFormatter = new Intl.DateTimeFormat('pl-PL', {
  month: 'long',
  year: 'numeric',
});

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatCalendarMonth(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  const label = monthFormatter.format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatCalendarDate(dateKey: string) {
  return dateFormatter.format(new Date(`${dateKey}T00:00:00`));
}

export function formatCalendarDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatEventTime(event: Pick<CalendarEvent, 'isAllDay' | 'eventTime'>) {
  return event.isAllDay || !event.eventTime ? 'Cały dzień' : event.eventTime;
}

export function getEventSortValue(event: CalendarEvent) {
  return `${event.eventDate}T${event.eventTime ?? '00:00'}`;
}
