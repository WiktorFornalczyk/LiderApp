import { BbRecord, BbRecordWithYard } from '../types/bbTypes';
import { formatBbRange } from './bbRangeUtils';

export function formatBbTitle(record: Pick<BbRecord, 'nrPartii' | 'bbOd' | 'bbDo'>) {
  return `Partia ${record.nrPartii} · ${formatBbRange(record.bbOd, record.bbDo)}`;
}

export function formatBool(value: boolean) {
  return value ? 'Tak' : 'Nie';
}

export function formatPallet(value: BbRecord['paleta']) {
  if (!value) {
    return 'Brak palety';
  }

  return value === 'drewniana' ? 'Paleta drewniana' : 'Paleta plastikowa';
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getBbSearchText(record: BbRecordWithYard) {
  return [
    record.nrPartii,
    record.rodzajSadzy,
    formatBbRange(record.bbOd, record.bbDo),
    record.yard.name,
    record.linia,
    record.paleta ?? '',
  ]
    .join(' ')
    .toLowerCase();
}
