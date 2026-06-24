import { YardInput, YardValidationErrors } from '../types/yardTypes';

export const yardErrorMessages = {
  nameRequired: 'Podaj nazwę placu.',
  nameTooLong: 'Nazwa placu może mieć maksymalnie 80 znaków.',
  descriptionTooLong: 'Opis może mieć maksymalnie 500 znaków.',
  saveFailed: 'Nie udało się zapisać placu.',
  deleteFailed: 'Nie udało się usunąć placu.',
  loadFailed: 'Nie udało się wczytać placów.',
  hasActiveBb:
    'Nie można usunąć placu, ponieważ znajdują się na nim aktywne zapisy BB. Najpierw przenieś lub zarchiwizuj te zapisy.',
};

export function sanitizeYardInput(input: YardInput): YardInput {
  return {
    name: input.name.replace(/\s+/g, ' ').trim(),
    description: input.description?.replace(/\s+/g, ' ').trim() || null,
  };
}

export function validateYardInput(input: YardInput): YardValidationErrors {
  const errors: YardValidationErrors = {};

  if (!input.name.trim()) {
    errors.name = yardErrorMessages.nameRequired;
  } else if (input.name.trim().length > 80) {
    errors.name = yardErrorMessages.nameTooLong;
  }

  if (input.description && input.description.length > 500) {
    errors.description = yardErrorMessages.descriptionTooLong;
  }

  return errors;
}

export function hasYardValidationErrors(errors: YardValidationErrors) {
  return Object.values(errors).some(Boolean);
}
