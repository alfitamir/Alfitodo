import { formatDateKey, addRecurrence } from './date';
import type { Task } from '../types';

export function createDemoTasks(): Task[] {
  const now = new Date();
  const today = formatDateKey(now);
  const yesterday = formatDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const tomorrow = formatDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));

  return [
    {
      id: crypto.randomUUID(),
      userId: 'demo-user',
      title: 'مراجعة أولويات اليوم وترتيب المهام المهمة',
      dueDate: today,
      recurrence: 'once',
      isCompleted: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      userId: 'demo-user',
      title: 'قراءة 20 صفحة من الكتاب',
      dueDate: today,
      recurrence: 'daily',
      isCompleted: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      userId: 'demo-user',
      title: 'إرسال ملخص الاجتماع إلى الفريق',
      dueDate: yesterday,
      recurrence: 'once',
      isCompleted: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      userId: 'demo-user',
      title: 'التخطيط لموعد الغد',
      dueDate: tomorrow,
      recurrence: 'weekly',
      isCompleted: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      userId: 'demo-user',
      title: 'شرب الماء ومراجعة قائمة الصحة',
      dueDate: today,
      recurrence: 'once',
      isCompleted: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];
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
