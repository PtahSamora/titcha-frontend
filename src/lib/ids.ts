import { randomUUID } from 'crypto';

export function uuid(): string {
  return randomUUID();
}

export function generateId(prefix: string): string {
  return `${prefix}-${randomUUID().split('-')[0]}`;
}
