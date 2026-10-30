export type Recurrence = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Task {
  id: string;
  userId: string;
  title: string;
  dueDate: string;
  recurrence: Recurrence;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  spawnedFromId?: string;
}

export interface TaskInput {
  title: string;
  dueDate: string;
  recurrence: Recurrence;
}

export interface AppSettings {
  geminiApiKey: string;
  firebaseConfig: string;
  theme: 'light' | 'dark';
}

export interface DemoUser {
  displayName: string;
  email: string;
  photoURL: string;
}

export const recurrenceLabels: Record<Recurrence, string> = {
  once: 'مرة واحدة',
  daily: 'يومي',
  weekly: 'أسبوعي',
  monthly: 'شهري',
  yearly: 'سنوي',
};
