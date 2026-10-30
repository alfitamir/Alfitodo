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
  theme: 'light' | 'dark';
}

export interface DemoUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  isDemo?: boolean;
}

export const recurrenceLabels: Record<Recurrence, string> = {
  once: 'مرة واحدة',
  daily: 'يومي',
  weekly: 'أسبوعي',
  monthly: 'شهري',
  yearly: 'سنوي',
};
