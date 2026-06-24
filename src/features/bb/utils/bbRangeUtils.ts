import { BbRecord } from '../types/bbTypes';

export function padBbNumber(value: number | string) {
  return String(value).padStart(3, '0');
}

export function formatBbRange(bbOd: number, bbDo: number) {
  return `BB ${padBbNumber(bbOd)}-${padBbNumber(bbDo)}`;
}

export function rangesOverlap(first: { bbOd: number; bbDo: number }, second: { bbOd: number; bbDo: number }) {
  return first.bbOd <= second.bbDo && second.bbOd <= first.bbDo;
}

export function isSameRange(first: { bbOd: number; bbDo: number }, second: { bbOd: number; bbDo: number }) {
  return first.bbOd === second.bbOd && first.bbDo === second.bbDo;
}

export function canSplitRange(record: Pick<BbRecord, 'bbOd' | 'bbDo'>, splitAfterNumber: number) {
  return splitAfterNumber >= record.bbOd && splitAfterNumber < record.bbDo;
}

export function previewSplitRange(record: Pick<BbRecord, 'bbOd' | 'bbDo'>, splitAfterNumber: number) {
  if (!canSplitRange(record, splitAfterNumber)) {
    return null;
  }

  return {
    first: { bbOd: record.bbOd, bbDo: splitAfterNumber },
    second: { bbOd: splitAfterNumber + 1, bbDo: record.bbDo },
  };
}
