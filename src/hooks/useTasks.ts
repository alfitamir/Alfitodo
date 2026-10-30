import { useCallback, useEffect, useMemo, useState } from 'react';
import { addRecurrence, isCompletedToday, todayKey } from '../lib/date';
import { loadTasks, saveTasks } from '../lib/storage';
import { firestoreRepository } from '../services/firestore';
import { firestoreDb } from '../services/firebase';
import type { Task, TaskInput } from '../types';

function makeTask(input: TaskInput, userId: string): Task {
  return {
    ...input,
    id: crypto.randomUUID(),
    userId,
    isCompleted: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
  };
}

export function useTasks(userId = 'demo-user') {
  const [tasks, setTasks] = useState<Task[]>(() => userId === 'demo-user' ? loadTasks() : []);

  useEffect(() => {
    let active = true;
    if (userId === 'demo-user' || !firestoreDb) {
      setTasks(loadTasks().filter((task) => task.userId === 'demo-user'));
      return () => { active = false; };
    }
    firestoreRepository.list(userId)
      .then((remoteTasks) => { if (active) setTasks(remoteTasks); })
      .catch((error) => { console.error('Unable to load cloud tasks', error); if (active) setTasks([]); });
    return () => { active = false; };
  }, [userId]);

  const commit = useCallback((next: Task[]) => {
    setTasks(next);
    if (userId === 'demo-user' || !firestoreDb) {
      saveTasks(next);
      return;
    }
    void Promise.all(next.map((task) => firestoreRepository.save(task)))
      .catch((error) => console.error('Unable to sync tasks to Firestore', error));
  }, [userId]);

  const addTask = useCallback((input: TaskInput) => {
    const task = makeTask(input, userId);
    commit([task, ...tasks]);
    return task;
  }, [commit, tasks, userId]);

  const addTasks = useCallback((inputs: TaskInput[]) => {
    const created = inputs.map((input) => makeTask(input, userId));
    commit([...created, ...tasks]);
    return created;
  }, [commit, tasks, userId]);

  const toggleTask = useCallback((id: string) => {
    const current = tasks.find((task) => task.id === id);
    if (!current) return;

    if (!current.isCompleted) {
      const now = new Date().toISOString();
      const next = tasks.map((task) => task.id === id ? { ...task, isCompleted: true, completedAt: now } : task);
      if (current.recurrence !== 'once') {
        const baseDate = current.dueDate > todayKey() ? current.dueDate : todayKey();
        next.unshift({
          ...current,
          id: crypto.randomUUID(),
          dueDate: addRecurrence(baseDate, current.recurrence),
          isCompleted: false,
          completedAt: null,
          createdAt: now,
          spawnedFromId: current.id,
        });
      }
      commit(next);
      return;
    }

    const isSameDay = isCompletedToday(current.completedAt);
    const next = tasks
      .filter((task) => !(isSameDay && task.spawnedFromId === current.id && !task.isCompleted))
      .map((task) => task.id === id ? { ...task, isCompleted: false, completedAt: null } : task);
    commit(next);
  }, [commit, tasks]);

  const updateTask = useCallback((id: string, patch: Partial<Pick<Task, 'title' | 'dueDate' | 'recurrence'>>) => {
    commit(tasks.map((task) => task.id === id ? { ...task, ...patch } : task));
  }, [commit, tasks]);

  const deleteTask = useCallback((id: string) => {
    commit(tasks.filter((task) => task.id !== id));
    if (userId !== 'demo-user' && firestoreDb) void firestoreRepository.remove(userId, id).catch((error) => console.error('Unable to delete cloud task', error));
  }, [commit, tasks, userId]);

  const moveToToday = useCallback((id: string) => {
    updateTask(id, { dueDate: todayKey() });
  }, [updateTask]);

  const moveAllToToday = useCallback(() => {
    const today = todayKey();
    commit(tasks.map((task) => task.dueDate < today && !task.isCompleted ? { ...task, dueDate: today } : task));
  }, [commit, tasks]);

  const groups = useMemo(() => {
    const today = todayKey();
    return {
      overdue: tasks.filter((task) => !task.isCompleted && task.dueDate < today),
      today: tasks.filter((task) => !task.isCompleted && task.dueDate === today),
      completed: tasks.filter((task) => task.isCompleted && isCompletedToday(task.completedAt)),
      upcoming: tasks.filter((task) => !task.isCompleted && task.dueDate > today).sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    };
  }, [tasks]);

  return { tasks, groups, addTask, addTasks, toggleTask, updateTask, deleteTask, moveToToday, moveAllToToday };
}
