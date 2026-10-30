import type { AppSettings, Task } from '../types';

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
  geminiApiKey: '',
  firebaseConfig: '',
  theme: 'light',
};

export function loadTasks(): Task[] {
  try {
    const saved = localStorage.getItem(TASKS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const cleaned = (parsed as Task[]).filter((task) => !LEGACY_DEMO_TITLES.has(task.title));
        if (cleaned.length !== parsed.length) saveTasks(cleaned);
        return cleaned;
      }
    }
  } catch {
    // Start with an empty board when storage is unavailable or corrupted.
  }
  return [];
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function loadSettings(): AppSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return { ...defaultSettings, ...JSON.parse(saved) } as AppSettings;
  } catch {
    // Fall back to defaults.
  }
  return defaultSettings;
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function clearDemoData(): void {
  localStorage.removeItem(TASKS_KEY);
}
