import { todayKey } from './date';
import type { Recurrence, TaskInput } from '../types';

/** Offline Arabic task parser used when no server-side AI service is configured. */
export function localHeuristicParse(text: string): TaskInput[] {
  const today = todayKey();
  const segments = text
    .split(/[\n،,؛;]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  return segments.map((segment) => {
    const lower = segment.toLocaleLowerCase('ar');
    const recurrence: Recurrence = /كل يوم|يومياً|يومي/.test(lower)
      ? 'daily'
      : /كل أسبوع|أسبوعياً|أسبوعي|كل جمعة/.test(lower)
        ? 'weekly'
        : /كل شهر|شهرياً|شهري/.test(lower)
          ? 'monthly'
          : /كل سنة|سنوي/.test(lower)
            ? 'yearly'
            : 'once';

    const dueDate = /بعد بكرة|بعد غد/.test(lower)
      ? shiftDay(today, 2)
      : /بكرة|غداً|غدا/.test(lower)
        ? shiftDay(today, 1)
        : today;
    const title = segment
      .replace(/^(بعد بكرة|بعد غد|بكرة|غداً|غدا|اليوم)\s*/i, '')
      .replace(/^(كل يوم|يومياً|يومي|كل أسبوع|أسبوعياً|أسبوعي|كل جمعة|كل شهر|شهرياً|شهري|كل سنة|سنوي)\s*/i, '')
      .trim();
    return { title: title || segment, dueDate, recurrence };
  });
}

function shiftDay(key: string, amount: number): string {
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year, month - 1, day + amount, 12, 0, 0, 0);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
