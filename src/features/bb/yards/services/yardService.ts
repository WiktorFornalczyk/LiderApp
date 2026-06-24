import { Yard, YardInput } from '../types/yardTypes';
import {
  hasYardValidationErrors,
  sanitizeYardInput,
  validateYardInput,
  yardErrorMessages,
} from '../validation/yardValidation';
import * as yardRepository from './yardRepository';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getYards() {
  return yardRepository.getYards();
}

export async function getYardById(id: string) {
  return yardRepository.getYardById(id);
}

export function validateYard(input: YardInput) {
  return validateYardInput(sanitizeYardInput(input));
}

export async function hasYardWithName(name: string, ignoredYardId?: string) {
  const yard = await yardRepository.findYardByName(name.trim());
  return Boolean(yard && yard.id !== ignoredYardId);
}

export async function createYard(input: YardInput) {
  const sanitized = sanitizeYardInput(input);
  const errors = validateYardInput(sanitized);

  if (hasYardValidationErrors(errors)) {
    throw new Error(Object.values(errors)[0] ?? yardErrorMessages.saveFailed);
  }

  const now = new Date().toISOString();
  const yard: Yard = {
    id: createId(),
    name: sanitized.name,
    description: sanitized.description ?? null,
    createdAt: now,
    updatedAt: now,
  };

  return yardRepository.createYard(yard);
}

export async function updateYard(id: string, input: YardInput) {
  const sanitized = sanitizeYardInput(input);
  const errors = validateYardInput(sanitized);

  if (hasYardValidationErrors(errors)) {
    throw new Error(Object.values(errors)[0] ?? yardErrorMessages.saveFailed);
  }

  return yardRepository.updateYard(id, { ...sanitized, updatedAt: new Date().toISOString() });
}

export async function deleteYard(id: string) {
  if (!(await yardRepository.canDeleteYard(id))) {
    throw new Error(yardErrorMessages.hasActiveBb);
  }

  return yardRepository.deleteYard(id);
}

export async function getActiveBbCountForYard(id: string) {
  return yardRepository.getActiveBbCountForYard(id);
}
