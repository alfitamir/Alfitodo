import type { AppSettings, Task } from '../types';
import { isValidDateKey } from './date';

const TASKS_KEY = 'tamer-do-list.tasks.v1';
const SETTINGS_KEY = 'tamer-do-list.settings.v1';
const LEGACY_DEMO_TITLES = new Set([
  'مراجعة أولويات اليوم وترتيب المهام المهمة',
  'قراءة 20 صفحة من الكتاب',
  'إرسال ملخص الاجتماع إلى الفريق',
  'التخطيط لموعد الغد',
  'شرب الماء ومراجعة قائمة الصحة',
]);

const defaultSettings: AppSettings = {
  theme: 'light',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTask(value: unknown): value is Task {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && typeof value.userId === 'string'
    && typeof value.title === 'string'
    && value.title.trim().length > 0
    && typeof value.dueDate === 'string'
    && isValidDateKey(value.dueDate)
    && ['once', 'daily', 'weekly', 'monthly', 'yearly'].includes(String(value.recurrence))
    && typeof value.isCompleted === 'boolean'
    && (value.completedAt === null || (typeof value.completedAt === 'string' && !Number.isNaN(Date.parse(value.completedAt))))
    && typeof value.createdAt === 'string'
    && !Number.isNaN(Date.parse(value.createdAt));
}

export function loadTasks(): Task[] {
  try {
    const saved = localStorage.getItem(TASKS_KEY);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    const cleaned = parsed.filter(isTask).filter((task) => !LEGACY_DEMO_TITLES.has(task.title));
    if (cleaned.length !== parsed.length) saveTasks(cleaned);
    return cleaned;
  } catch {
    // Keep the app usable when storage is unavailable, corrupted, or quota-limited.
    return [];
  }
}

/** Returns false rather than crashing the task UI when browser storage is unavailable. */
export function saveTasks(tasks: Task[]): boolean {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}

export function loadSettings(): AppSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) return { ...defaultSettings };
    const parsed: unknown = JSON.parse(saved);
    if (!isRecord(parsed)) return { ...defaultSettings };
    return {
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
    };
  } catch {
    return { ...defaultSettings };
  }
}

/** Gemini keys are session-only; never write them to localStorage. */
export function saveSettings(settings: AppSettings): boolean {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ theme: settings.theme }));
    return true;
  } catch {
    return false;
  }
}

export function clearDemoData(): void {
  try {
    localStorage.removeItem(TASKS_KEY);
  } catch {
    // Ignore unavailable storage.
  }
}
