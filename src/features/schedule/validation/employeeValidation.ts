import { EmployeeInput, EmployeeValidationErrors } from '../types/employeeTypes';

export const employeeErrorMessages = {
  fullNameRequired: 'Podaj imię i nazwisko pracownika.',
  fullNameTooLong: 'Imię i nazwisko może mieć maksymalnie 80 znaków.',
  saveFailed: 'Nie udało się zapisać pracownika.',
};

export function sanitizeEmployeeInput(input: EmployeeInput): EmployeeInput {
  return {
    ...input,
    fullName: input.fullName.replace(/\s+/g, ' ').trim(),
  };
}

export function validateEmployeeInput(input: EmployeeInput): EmployeeValidationErrors {
  const errors: EmployeeValidationErrors = {};

  if (!input.fullName.trim()) {
    errors.fullName = employeeErrorMessages.fullNameRequired;
  } else if (input.fullName.trim().length > 80) {
    errors.fullName = employeeErrorMessages.fullNameTooLong;
  }

  return errors;
}

export function hasEmployeeValidationErrors(errors: EmployeeValidationErrors) {
  return Object.values(errors).some(Boolean);
}
