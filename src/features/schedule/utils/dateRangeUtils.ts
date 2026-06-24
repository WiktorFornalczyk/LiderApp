const dayMs = 24 * 60 * 60 * 1000;

function toUtcDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getTodayDate() {
  return formatDate(new Date());
}

export function addDays(date: string, days: number) {
  return formatDate(new Date(toUtcDate(date).getTime() + days * dayMs));
}

export function getDateRange(startDate: string, endDate: string) {
  const dates: string[] = [];
  let cursor = toUtcDate(startDate);
  const end = toUtcDate(endDate);

  while (cursor.getTime() <= end.getTime()) {
    dates.push(formatDate(cursor));
    cursor = new Date(cursor.getTime() + dayMs);
  }

  return dates;
}

export function getDefaultWeekRange(anchorDate = new Date()) {
  const day = anchorDate.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(anchorDate.getTime() + mondayOffset * dayMs);
  const startDate = formatDate(monday);

  return {
    startDate,
    endDate: addDays(startDate, 6),
  };
}

export function shiftRangeByDays(range: { startDate: string; endDate: string }, days: number) {
  return {
    startDate: addDays(range.startDate, days),
    endDate: addDays(range.endDate, days),
  };
}

export function getPreviousRange(range: { startDate: string; endDate: string }) {
  const length = getDateRange(range.startDate, range.endDate).length;

  return {
    startDate: addDays(range.startDate, -length),
    endDate: addDays(range.endDate, -length),
  };
}

export function getDateDifferenceInDays(startDate: string, endDate: string) {
  return Math.round((toUtcDate(endDate).getTime() - toUtcDate(startDate).getTime()) / dayMs);
}

export function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = toUtcDate(value);
  return !Number.isNaN(date.getTime()) && formatDate(date) === value;
}

export function formatDisplayDate(value: string) {
  const [year, month, day] = value.split('-');
  return `${day}.${month}.${year}`;
}

export function getDayLabel(value: string) {
  const labels = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'];
  return labels[toUtcDate(value).getUTCDay()];
}
