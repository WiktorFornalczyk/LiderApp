export type CalendarEventType =
  | 'Praca'
  | 'Grafik'
  | 'Raport'
  | 'BB'
  | 'Urlop'
  | 'Spotkanie'
  | 'Przypomnienie'
  | 'Inne';

export const calendarEventTypes: CalendarEventType[] = [
  'Praca',
  'Grafik',
  'Raport',
  'BB',
  'Urlop',
  'Spotkanie',
  'Przypomnienie',
  'Inne',
];

export type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  eventTime: string | null;
  eventType: CalendarEventType;
  isAllDay: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CalendarEventRow = Omit<CalendarEvent, 'isAllDay'> & {
  isAllDay: number;
};

export type CalendarEventInput = {
  title: string;
  description?: string | null;
  eventDate: string;
  eventTime?: string | null;
  eventType?: CalendarEventType | null;
  isAllDay: boolean;
};

export type CalendarFilterMode = 'all' | 'upcoming' | 'past' | 'today' | 'type';

export type CalendarSortMode = 'upcoming' | 'created_desc' | 'oldest';

export type CalendarFiltersState = {
  mode: CalendarFilterMode;
  eventType?: CalendarEventType | null;
  query: string;
  sortMode: CalendarSortMode;
};

export type CalendarEventValidationErrors = Partial<Record<keyof CalendarEventInput, string>>;
