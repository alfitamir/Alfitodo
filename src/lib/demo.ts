import { addRecurrence } from './date';
import type { Task } from '../types';

export function createDemoTasks(): Task[] {
  return [];
}

export function makeSpawnedTask(source: Task, baseDate: string): Task {
  return {
    ...source,
    id: crypto.randomUUID(),
    dueDate: addRecurrence(baseDate, source.recurrence),
    isCompleted: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
    spawnedFromId: source.id,
  };
}
