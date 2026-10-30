import { httpsCallable } from 'firebase/functions';
import { firebaseAuth, firebaseFunctions } from './firebase';
import { localHeuristicParse } from '../lib/taskParser';
import type { Recurrence, TaskInput } from '../types';

const recurrenceValues: Recurrence[] = ['once', 'daily', 'weekly', 'monthly', 'yearly'];

function normaliseTasks(value: unknown): TaskInput[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null && !Array.isArray(item))
    .filter((item) => typeof item.title === 'string' && item.title.trim())
    .map((item) => ({
      title: String(item.title).trim(),
      dueDate: typeof item.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.dueDate) ? item.dueDate : '',
      recurrence: recurrenceValues.includes(item.recurrence as Recurrence) ? item.recurrence as Recurrence : 'once',
    }))
    .filter((item) => item.dueDate);
}

export async function parseBrainDump(text: string): Promise<TaskInput[]> {
  const currentUser = firebaseAuth?.currentUser;
  if (!currentUser || !firebaseFunctions) return localHeuristicParse(text);

  const parse = httpsCallable<{ text: string }, unknown>(firebaseFunctions, 'parseTasks');
  const result = await parse({ text });
  return normaliseTasks(result.data);
}
