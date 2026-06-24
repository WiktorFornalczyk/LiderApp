import { Employee, EmployeeInput } from '../types/employeeTypes';
import {
  employeeErrorMessages,
  hasEmployeeValidationErrors,
  sanitizeEmployeeInput,
  validateEmployeeInput,
} from '../validation/employeeValidation';
import * as employeeRepository from './employeeRepository';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getEmployees(options?: { includeInactive?: boolean }) {
  const employees = await employeeRepository.getEmployees();
  return options?.includeInactive ? employees : employees.filter((employee) => employee.isActive);
}

export function validateEmployee(input: EmployeeInput) {
  return validateEmployeeInput(sanitizeEmployeeInput(input));
}

export async function hasActiveEmployeeWithName(fullName: string, ignoredEmployeeId?: string) {
  const employee = await employeeRepository.findActiveEmployeeByName(fullName.trim());
  return Boolean(employee && employee.id !== ignoredEmployeeId);
}

export async function createEmployee(input: EmployeeInput) {
  const sanitized = sanitizeEmployeeInput(input);
  const errors = validateEmployeeInput(sanitized);

  if (hasEmployeeValidationErrors(errors)) {
    throw new Error(Object.values(errors)[0] ?? employeeErrorMessages.saveFailed);
  }

  const now = new Date().toISOString();
  const employee: Employee = {
    id: createId(),
    fullName: sanitized.fullName,
    isActive: sanitized.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };

  return employeeRepository.createEmployee(employee);
}

export async function updateEmployee(id: string, input: EmployeeInput) {
  const sanitized = sanitizeEmployeeInput(input);
  const errors = validateEmployeeInput(sanitized);

  if (hasEmployeeValidationErrors(errors)) {
    throw new Error(Object.values(errors)[0] ?? employeeErrorMessages.saveFailed);
  }

  return employeeRepository.updateEmployee(id, {
    ...sanitized,
    isActive: sanitized.isActive ?? true,
    updatedAt: new Date().toISOString(),
  });
}

export async function deactivateEmployee(id: string) {
  return employeeRepository.deactivateEmployee(id);
}

export async function reactivateEmployee(id: string) {
  return employeeRepository.reactivateEmployee(id);
}

export async function deleteEmployee(id: string) {
  return employeeRepository.deleteEmployee(id);
}

export async function getActiveEmployeesCount() {
  return employeeRepository.getActiveEmployeesCount();
}
