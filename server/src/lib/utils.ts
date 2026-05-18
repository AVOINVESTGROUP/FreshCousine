import { randomUUID } from 'crypto';

export function nowIso() {
  return new Date().toISOString();
}

export function generateId(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}

export function roundUpMinor(value: number) {
  return Math.ceil(value);
}
