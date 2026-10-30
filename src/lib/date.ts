import type { Recurrence } from '../types';

const pad = (value: number) => String(value).padStart(2, '0');

export function formatDateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(key: string): Date {
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
  if (recurrence === 'yearly') date.setFullYear(date.getFullYear() + 1);
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
  return iso ? formatDateKey(new Date(iso)) : null;
}

export function isCompletedToday(completedAt: string | null, dueDate: string): boolean {
  return localDateFromIso(completedAt) === todayKey() || dueDate === todayKey();
}

export function getDayName(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(date);
}
