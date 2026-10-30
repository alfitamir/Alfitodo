import type { AppSettings, Task } from '../types';
import { createDemoTasks } from './demo';

const TASKS_KEY = 'tamer-do-list.tasks.v1';
const SETTINGS_KEY = 'tamer-do-list.settings.v1';

const defaultSettings: AppSettings = {
  geminiApiKey: '',
  firebaseConfig: '',
  theme: 'light',
};

export function loadTasks(): Task[] {
  try {
    const saved = localStorage.getItem(TASKS_KEY);
    if (saved) return JSON.parse(saved) as Task[];
  } catch {
    // Use the demo seed when storage is unavailable or corrupted.
  }
  const demo = createDemoTasks();
  saveTasks(demo);
  return demo;
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
