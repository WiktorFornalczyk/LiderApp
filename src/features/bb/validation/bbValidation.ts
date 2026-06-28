import { BbInput, BbValidationErrors } from '../types/bbTypes';

const commonCarbonGrades = new Set(['330', '339', '326', '375']);

export const bbErrorMessages = {
  nrPartiiRequired: 'Podaj numer partii.',
  nrPartiiDigits: 'Numer partii może zawierać tylko cyfry.',
  rodzajSadzyRequired: 'Podaj rodzaj sadzy.',
  placRequired: 'Wybierz plac.',
  bbOdRequired: 'Podaj numer BB od.',
  bbDoRequired: 'Podaj numer BB do.',
  bbDigits: 'Numer BB może mieć maksymalnie 3 cyfry.',
  bbOrder: 'Numer BB od nie może być większy niż numer BB do.',
  lineRequired: 'Wybierz linię.',
  saveFailed: 'Nie udało się zapisać BB.',
  loadFailed: 'Nie udało się wczytać BB.',
  archiveFailed: 'Nie udało się zarchiwizować BB.',
  restoreFailed: 'Nie udało się przywrócić BB.',
  splitFailed: 'Nie udało się podzielić partii.',
  importFailed: 'Nie udało się zaimportować danych.',
  exportFailed: 'Nie udało się wyeksportować danych.',
};

function normalizeText(value: string | null | undefined) {
  return value?.replace(/\s+/g, ' ').trim() ?? '';
}

function normalizeCarbonType(value: string) {
  const normalized = normalizeText(value).toUpperCase().replace(/\s+/g, '');
  const grade = normalized.startsWith('N') ? normalized.slice(1) : normalized;

  return commonCarbonGrades.has(grade) ? `N${grade}` : normalizeText(value);
}

export function sanitizeBbInput(input: BbInput): BbInput {
  return {
    ...input,
    placId: normalizeText(input.placId),
    nrPartii: normalizeText(input.nrPartii),
    rodzajSadzy: normalizeCarbonType(input.rodzajSadzy),
    bbOd: typeof input.bbOd === 'number' ? input.bbOd : normalizeText(input.bbOd),
    bbDo: typeof input.bbDo === 'number' ? input.bbDo : normalizeText(input.bbDo),
    paleta: input.paleta ?? null,
    strecz: input.strecz ?? false,
    kapturownica: input.kapturownica ?? false,
    uwagi: normalizeText(input.uwagi) || null,
  };
}

export function validateBbInput(input: BbInput): BbValidationErrors {
  const errors: BbValidationErrors = {};
  const bbOdText = String(input.bbOd ?? '').trim();
  const bbDoText = String(input.bbDo ?? '').trim();

  if (!input.nrPartii.trim()) {
    errors.nrPartii = bbErrorMessages.nrPartiiRequired;
  } else if (!/^\d+$/.test(input.nrPartii.trim())) {
    errors.nrPartii = bbErrorMessages.nrPartiiDigits;
  }

  if (!input.rodzajSadzy.trim()) {
    errors.rodzajSadzy = bbErrorMessages.rodzajSadzyRequired;
  }

  if (!input.placId.trim()) {
    errors.placId = bbErrorMessages.placRequired;
  }

  if (!bbOdText) {
    errors.bbOd = bbErrorMessages.bbOdRequired;
  } else if (!/^\d{1,3}$/.test(bbOdText) || Number(bbOdText) < 1) {
    errors.bbOd = bbErrorMessages.bbDigits;
  }

  if (!bbDoText) {
    errors.bbDo = bbErrorMessages.bbDoRequired;
  } else if (!/^\d{1,3}$/.test(bbDoText) || Number(bbDoText) < 1) {
    errors.bbDo = bbErrorMessages.bbDigits;
  }

  if (!errors.bbOd && !errors.bbDo && Number(bbOdText) > Number(bbDoText)) {
    errors.bbDo = bbErrorMessages.bbOrder;
  }

  if (input.linia !== 'L-I' && input.linia !== 'L-II') {
    errors.linia = bbErrorMessages.lineRequired;
  }

  if (input.paleta && input.paleta !== 'drewniana' && input.paleta !== 'plastikowa') {
    errors.paleta = 'Wybierz poprawny typ palety.';
  }

  return errors;
}

export function hasBbValidationErrors(errors: BbValidationErrors) {
  return Object.values(errors).some(Boolean);
}
