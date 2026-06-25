import * as SQLite from 'expo-sqlite';

import { runCalendarMigration } from '../database/migrations/calendarMigration';
import {
  CalendarEvent,
  CalendarEventInput,
  CalendarEventRow,
  CalendarFiltersState,
  CalendarSortMode,
} from '../types/calendarTypes';
import { getTodayDate } from '../utils/calendarDateUtils';

const DATABASE_NAME = 'liderapp.db';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await runCalendarMigration(db);
      return db;
    });
  }

  return databasePromise;
}

function mapRowToEvent(row: CalendarEventRow): CalendarEvent {
  return {
    ...row,
    eventType: row.eventType ?? 'Inne',
    isAllDay: row.isAllDay === 1,
  };
}

function getOrderBy(sortMode: CalendarSortMode = 'upcoming') {
  if (sortMode === 'created_desc') {
    return 'createdAt DESC';
  }

  if (sortMode === 'oldest') {
    return "eventDate ASC, coalesce(eventTime, '00:00') ASC";
  }

  return "eventDate ASC, coalesce(eventTime, '00:00') ASC";
}

export async function getEvents(sortMode: CalendarSortMode = 'upcoming') {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CalendarEventRow>(`SELECT * FROM calendar_events ORDER BY ${getOrderBy(sortMode)}`);
  return rows.map(mapRowToEvent);
}

export async function getEventById(id: string) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<CalendarEventRow>('SELECT * FROM calendar_events WHERE id = ?', id);
  return row ? mapRowToEvent(row) : null;
}

export async function getEventsByDate(date: string) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CalendarEventRow>(
    "SELECT * FROM calendar_events WHERE eventDate = ? ORDER BY coalesce(eventTime, '00:00') ASC",
    date
  );
  return rows.map(mapRowToEvent);
}

export async function getEventsByDateRange(startDate: string, endDate: string) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CalendarEventRow>(
    "SELECT * FROM calendar_events WHERE eventDate BETWEEN ? AND ? ORDER BY eventDate ASC, coalesce(eventTime, '00:00') ASC",
    startDate,
    endDate
  );
  return rows.map(mapRowToEvent);
}

export async function getUpcomingEvents(limit = 5) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CalendarEventRow>(
    "SELECT * FROM calendar_events WHERE eventDate >= ? ORDER BY eventDate ASC, coalesce(eventTime, '00:00') ASC LIMIT ?",
    getTodayDate(),
    limit
  );
  return rows.map(mapRowToEvent);
}

export async function getTodayEvents() {
  return getEventsByDate(getTodayDate());
}

export async function searchEvents(query: string, sortMode: CalendarSortMode = 'upcoming') {
  const db = await getDatabase();
  const normalizedQuery = `%${query.trim().toLowerCase()}%`;
  const rows = await db.getAllAsync<CalendarEventRow>(
    `SELECT * FROM calendar_events
     WHERE lower(title) LIKE ? OR lower(coalesce(description, '')) LIKE ? OR lower(coalesce(eventType, '')) LIKE ?
     ORDER BY ${getOrderBy(sortMode)}`,
    normalizedQuery,
    normalizedQuery,
    normalizedQuery
  );
  return rows.map(mapRowToEvent);
}

export async function filterEvents(filters: CalendarFiltersState) {
  const db = await getDatabase();
  const clauses: string[] = [];
  const params: (string | number)[] = [];
  const today = getTodayDate();

  if (filters.mode === 'upcoming') {
    clauses.push('eventDate >= ?');
    params.push(today);
  }

  if (filters.mode === 'past') {
    clauses.push('eventDate < ?');
    params.push(today);
  }

  if (filters.mode === 'today') {
    clauses.push('eventDate = ?');
    params.push(today);
  }

  if (filters.mode === 'type' && filters.eventType) {
    clauses.push('eventType = ?');
    params.push(filters.eventType);
  }

  if (filters.query.trim()) {
    const query = `%${filters.query.trim().toLowerCase()}%`;
    clauses.push("(lower(title) LIKE ? OR lower(coalesce(description, '')) LIKE ? OR lower(coalesce(eventType, '')) LIKE ?)");
    params.push(query, query, query);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = await db.getAllAsync<CalendarEventRow>(
    `SELECT * FROM calendar_events ${where} ORDER BY ${getOrderBy(filters.sortMode)}`,
    ...params
  );
  return rows.map(mapRowToEvent);
}

export async function createEvent(event: CalendarEvent) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO calendar_events
     (id, title, description, eventDate, eventTime, eventType, isAllDay, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    event.id,
    event.title,
    event.description,
    event.eventDate,
    event.eventTime,
    event.eventType,
    event.isAllDay ? 1 : 0,
    event.createdAt,
    event.updatedAt
  );
  return event;
}

export async function updateEvent(id: string, input: CalendarEventInput & { updatedAt: string }) {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE calendar_events
     SET title = ?, description = ?, eventDate = ?, eventTime = ?, eventType = ?, isAllDay = ?, updatedAt = ?
     WHERE id = ?`,
    input.title,
    input.description ?? null,
    input.eventDate,
    input.isAllDay ? null : input.eventTime ?? null,
    input.eventType ?? 'Inne',
    input.isAllDay ? 1 : 0,
    input.updatedAt,
    id
  );
  return getEventById(id);
}

export async function deleteEvent(id: string) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM calendar_events WHERE id = ?', id);
}
