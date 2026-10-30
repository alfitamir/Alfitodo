import type { Recurrence } from '../types';

const pad = (value: number) => String(value).padStart(2, '0');

export function formatDateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isValidDateKey(key: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function parseDateKey(key: string): Date {
  if (!isValidDateKey(key)) throw new RangeError(`Invalid date key: ${key}`);
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function todayKey(): string {
  return formatDateKey(new Date());
}

export function addRecurrence(dateKey: string, recurrence: Recurrence): string {
  const date = parseDateKey(dateKey);
  if (recurrence === 'daily') date.setDate(date.getDate() + 1);
  if (recurrence === 'weekly') date.setDate(date.getDate() + 7);
  if (recurrence === 'monthly') {
    const originalDay = date.getDate();
    date.setDate(1);
    date.setMonth(date.getMonth() + 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    date.setDate(Math.min(originalDay, lastDay));
  }
  if (recurrence === 'yearly') {
    const month = date.getMonth();
    const day = date.getDate();
    date.setFullYear(date.getFullYear() + 1);
    // Keep leap-day anniversaries on the last valid day of February.
    if (date.getMonth() !== month) date.setDate(0);
    else if (date.getDate() !== day) date.setDate(0);
  }
  return formatDateKey(date);
}

export function formatArabicLongDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatShortArabicDate(dateKey: string): string {
  return new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parseDateKey(dateKey));
}

export function localDateFromIso(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : formatDateKey(date);
}

/** Completion is determined by the completion timestamp, never by the due date. */
export function isCompletedToday(completedAt: string | null): boolean {
  return localDateFromIso(completedAt) === todayKey();
}

export function getDayName(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(date);
}
