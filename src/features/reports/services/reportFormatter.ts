import * as scheduleService from '@/src/features/schedule/services/scheduleService';

import { ParsedReportEntry } from './reportOcrParser';

export type ReportShiftNumber = 1 | 2 | 3;

export type ReportDraftEntry = {
  id: string;
  shiftNumber: ReportShiftNumber;
  parsedEntry: ParsedReportEntry;
};

export type ReportTemperatures = Record<ReportShiftNumber, string>;

const reportShiftNumbers: ReportShiftNumber[] = [1, 2, 3];

export async function buildFormattedReport(entries: ReportDraftEntry[], temperatures: ReportTemperatures) {
  const reportDate = getYesterdayIsoDate();
  const displayDate = formatDisplayDate(reportDate);
  const hourlySummary = await buildHourlySummary(reportDate);
  const includedShiftNumbers = getIncludedShiftNumbers(entries);
  const sections: string[] = [displayDate];

  for (const shiftNumber of includedShiftNumbers) {
    const shiftEntries = entries.filter((entry) => entry.shiftNumber === shiftNumber);

    sections.push(`Zmiana ${shiftNumber}`);
    sections.push(...formatProductionLines(shiftEntries));
    sections.push(formatTemperatureLine(shiftEntries, temperatures[shiftNumber]));
    sections.push('');
  }

  sections.push('Raport godzinowy:');
  sections.push(displayDate);

  for (const shiftNumber of includedShiftNumbers) {
    const summary = hourlySummary[shiftNumber];
    sections.push(`Zmiana ${shiftNumber} - ${summary.peopleCount} osób ~ ${summary.hours} godzin`);
  }

  return sections.join('\n').trim();
}

function getIncludedShiftNumbers(entries: ReportDraftEntry[]) {
  return reportShiftNumbers.filter((shiftNumber) => entries.some((entry) => entry.shiftNumber === shiftNumber));
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

function formatTemperatureLine(entries: ReportDraftEntry[], manualTemperature: string) {
  const points = entries.flatMap((entry) => buildTemperaturePoints(entry.parsedEntry, manualTemperature));

  if (points.length === 0) {
    return 'Temperatura: BB(...) (...)°C';
  }

  return `Temperatura: ${points.join(', ')}`;
}

function buildTemperaturePoints(entry: ParsedReportEntry, manualTemperature: string) {
  if (entry.rangeFrom === null || entry.rangeTo === null) {
    return [];
  }

  const temperatureByBb = new Map(entry.temperatures.map((point) => [point.bbNumber, point.value]));
  const fallbackTemperature = manualTemperature.trim();

  return getTemperatureBbNumbers(entry.rangeFrom, entry.rangeTo).map((bbNumber) => {
    const temperature = temperatureByBb.get(bbNumber) ?? fallbackTemperature;
    return `BB${bbNumber} ${temperature || '(...)'}°C`;
  });
}

function getTemperatureBbNumbers(from: number, to: number) {
  const start = Math.min(from, to);
  const end = Math.max(from, to);
  const numbers = [start];
  const firstStep = Math.ceil(start / 10) * 10;

  for (let bbNumber = firstStep; bbNumber <= end; bbNumber += 10) {
    if (bbNumber !== start) {
      numbers.push(bbNumber);
    }
  }

  return numbers;
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
