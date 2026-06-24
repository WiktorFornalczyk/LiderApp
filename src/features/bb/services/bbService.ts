import { BbDuplicateResult, BbFilters, BbInput, BbRecord, BbSortMode } from '../types/bbTypes';
import { formatBbRange } from '../utils/bbRangeUtils';
import {
  bbErrorMessages,
  hasBbValidationErrors,
  sanitizeBbInput,
  validateBbInput,
} from '../validation/bbValidation';
import * as bbRepository from './bbRepository';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getBbRecords(options: { query?: string; filters?: BbFilters; sortMode?: BbSortMode } = {}) {
  const query = options.query?.trim();

  if (query) {
    return bbRepository.searchBbRecords(query);
  }

  if (options.filters && Object.values(options.filters).some((value) => value !== undefined && value !== null && value !== '')) {
    return bbRepository.filterBbRecords(options.filters, options.sortMode);
  }

  return bbRepository.getActiveBbRecords(options.sortMode);
}

export async function getArchivedBbRecords() {
  return bbRepository.getArchivedBbRecords();
}

export async function getBbRecordById(id: string) {
  return bbRepository.getBbRecordById(id);
}

export async function getBbRecordsByYard(placId: string) {
  return bbRepository.getBbRecordsByYard(placId);
}

export function validateBb(input: BbInput) {
  return validateBbInput(sanitizeBbInput(input));
}

export async function getPotentialConflict(input: BbInput, ignoredId?: string): Promise<BbDuplicateResult | null> {
  const sanitized = sanitizeBbInput(input);
  const errors = validateBbInput(sanitized);

  if (hasBbValidationErrors(errors)) {
    return null;
  }

  const nrPartii = sanitized.nrPartii;
  const bbOd = Number(sanitized.bbOd);
  const bbDo = Number(sanitized.bbDo);
  const duplicate = await bbRepository.findDuplicateBbRecord({ nrPartii, bbOd, bbDo, ignoredId });

  if (duplicate) {
    return { type: 'duplicate', record: duplicate };
  }

  const overlaps = await bbRepository.findOverlappingBbRanges({ nrPartii, bbOd, bbDo, ignoredId });

  if (overlaps.length > 0) {
    return { type: 'overlap', record: overlaps[0] };
  }

  return null;
}

export function getConflictMessage(conflict: BbDuplicateResult) {
  const prefix =
    conflict.type === 'duplicate'
      ? 'Znaleziono możliwy duplikat'
      : 'Zakres nachodzi na aktywny zapis';

  return `${prefix}: partia ${conflict.record.nrPartii}, ${formatBbRange(
    conflict.record.bbOd,
    conflict.record.bbDo
  )}, ${conflict.record.yard.name}.`;
}

export async function createBbRecord(input: BbInput) {
  const sanitized = sanitizeBbInput(input);
  const errors = validateBbInput(sanitized);

  if (hasBbValidationErrors(errors)) {
    throw new Error(Object.values(errors)[0] ?? bbErrorMessages.saveFailed);
  }

  const now = new Date().toISOString();
  const record: BbRecord = {
    id: createId(),
    placId: sanitized.placId,
    nrPartii: sanitized.nrPartii,
    rodzajSadzy: sanitized.rodzajSadzy,
    bbOd: Number(sanitized.bbOd),
    bbDo: Number(sanitized.bbDo),
    linia: sanitized.linia === 'L-II' ? 'L-II' : 'L-I',
    paleta: sanitized.paleta ?? null,
    strecz: sanitized.strecz ?? false,
    kapturownica: sanitized.kapturownica ?? false,
    uwagi: sanitized.uwagi ?? null,
    status: 'active',
    archivedAt: null,
    parentId: null,
    splitFromId: null,
    splitAt: null,
    createdAt: now,
    updatedAt: now,
  };

  await bbRepository.setSetting('lastBbPlacId', record.placId);
  await bbRepository.setSetting('lastBbLine', record.linia);
  return bbRepository.createBbRecord(record);
}

export async function updateBbRecord(id: string, input: BbInput) {
  const sanitized = sanitizeBbInput(input);
  const errors = validateBbInput(sanitized);

  if (hasBbValidationErrors(errors)) {
    throw new Error(Object.values(errors)[0] ?? bbErrorMessages.saveFailed);
  }

  await bbRepository.setSetting('lastBbPlacId', sanitized.placId);
  await bbRepository.setSetting('lastBbLine', sanitized.linia);
  return bbRepository.updateBbRecord(id, {
    ...sanitized,
    updatedAt: new Date().toISOString(),
  });
}

export function duplicateToInput(record: BbRecord): BbInput {
  return {
    placId: record.placId,
    nrPartii: record.nrPartii,
    rodzajSadzy: record.rodzajSadzy,
    bbOd: String(record.bbOd),
    bbDo: String(record.bbDo),
    linia: record.linia,
    paleta: record.paleta,
    strecz: record.strecz,
    kapturownica: record.kapturownica,
    uwagi: record.uwagi,
  };
}

export async function moveBbRecordToYard(id: string, placId: string) {
  const record = await bbRepository.getBbRecordById(id);

  if (!record) {
    throw new Error(bbErrorMessages.loadFailed);
  }

  return updateBbRecord(id, { ...duplicateToInput(record), placId });
}

export async function getRecentlyUsedCarbonTypes() {
  return bbRepository.getRecentlyUsedCarbonTypes();
}

export async function getDashboardBbSummary() {
  const [counts, recent] = await Promise.all([bbRepository.getBbCounts(), bbRepository.getRecentBbRecords(3)]);
  return { counts, recent };
}

export async function getLastBbDefaults() {
  const [placId, linia] = await Promise.all([
    bbRepository.getSetting('lastBbPlacId'),
    bbRepository.getSetting('lastBbLine'),
  ]);

  return {
    placId,
    linia: linia === 'L-II' ? 'L-II' : 'L-I',
  };
}
