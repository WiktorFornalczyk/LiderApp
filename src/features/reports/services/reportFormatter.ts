import * as scheduleService from '@/src/features/schedule/services/scheduleService';

import { ParsedReportEntry } from './reportOcrParser';

export type ReportShiftNumber = 1 | 2 | 3;

export type ReportDraftEntry = {
  id: string;
  shiftNumber: ReportShiftNumber;
  parsedEntry: ParsedReportEntry;
};

export type ReportTemperatures = Record<ReportShiftNumber, string>;

export async function buildFormattedReport(entries: ReportDraftEntry[], temperatures: ReportTemperatures) {
  const reportDate = getYesterdayIsoDate();
  const displayDate = formatDisplayDate(reportDate);
  const hourlySummary = await buildHourlySummary(reportDate);
  const sections: string[] = [displayDate];

  for (const shiftNumber of [1, 2] as const) {
    sections.push(`Zmiana ${shiftNumber}`);
    sections.push(...formatProductionLines(entries.filter((entry) => entry.shiftNumber === shiftNumber)));
    sections.push(`Temperatura: ${temperatures[shiftNumber].trim() || '(...)'}BB-(...)°C`);
    sections.push('');
  }

  sections.push('Raport godzinowy:');
  sections.push(displayDate);

  for (const shiftNumber of [1, 2, 3] as const) {
    const summary = hourlySummary[shiftNumber];
    sections.push(`Zmiana ${shiftNumber} - ${summary.peopleCount} osób ~ ${summary.hours} godzin`);
  }

  return sections.join('\n').trim();
}

function formatProductionLines(entries: ReportDraftEntry[]) {
  if (entries.length === 0) {
    return ['-P(...) BB(...)-(...), pobrano próbki, wywieziono na plac nr (...)'];
  }

  return entries.map((entry) => {
    const parsed = entry.parsedEntry;
    const batchNumber = parsed.batchNumber ?? 'P(...)';
    const rangeFrom = parsed.rangeFrom ?? '(...)';
    const rangeTo = parsed.rangeTo ?? '(...)';
    const yardNumber = parsed.yardText?.match(/\d+/)?.[0] ?? '(...)';

    return `-${batchNumber} BB${rangeFrom}-${rangeTo}, pobrano próbki, wywieziono na plac nr ${yardNumber}`;
  });
}

async function buildHourlySummary(reportDate: string) {
  const entries = await scheduleService.getScheduleEntriesForDates([reportDate]);
  const summary: Record<ReportShiftNumber, { peopleCount: number; hours: number }> = {
    1: { peopleCount: 0, hours: 0 },
    2: { peopleCount: 0, hours: 0 },
    3: { peopleCount: 0, hours: 0 },
  };

  for (const entry of entries) {
    if (entry.shiftNumber === 1 || entry.shiftNumber === 2 || entry.shiftNumber === 3) {
      summary[entry.shiftNumber].peopleCount += 1;
      summary[entry.shiftNumber].hours += entry.hours;
    }
  }

  return summary;
}

export function getYesterdayIsoDate() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return formatIsoDate(date);
}

function formatDisplayDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
