export function getTodayDate() {
  return formatDateKey(new Date());
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function getMonthStart(dateKey: string) {
  const date = parseDateKey(dateKey);
  return formatDateKey(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function addMonths(dateKey: string, amount: number) {
  const date = parseDateKey(dateKey);
  return formatDateKey(new Date(date.getFullYear(), date.getMonth() + amount, 1));
}

export function getMonthRange(monthKey: string) {
  const date = parseDateKey(monthKey);
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    startDate: formatDateKey(start),
    endDate: formatDateKey(end),
  };
}

export function getCalendarGridDays(monthKey: string) {
  const monthDate = parseDateKey(monthKey);
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const mondayBasedOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - mondayBasedOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const next = new Date(gridStart);
    next.setDate(gridStart.getDate() + index);

    return {
      date: formatDateKey(next),
      dayNumber: next.getDate(),
      isCurrentMonth: next.getMonth() === monthDate.getMonth(),
    };
  });
}

export function isValidDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = parseDateKey(value);
  return formatDateKey(date) === value;
}

export function isValidTime(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    return false;
  }

  const [hours, minutes] = value.split(':').map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}
