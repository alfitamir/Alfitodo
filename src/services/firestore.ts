import { collection, deleteDoc, doc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import type { Task } from '../types';
import { firestoreDb } from './firebase';

export interface TaskRepository {
  list(userId: string): Promise<Task[]>;
  save(task: Task): Promise<void>;
  remove(userId: string, taskId: string): Promise<void>;
  sync(userId: string, tasks: Task[]): Promise<void>;
}

function taskCollection(userId: string) {
  if (!firestoreDb) throw new Error('Firestore is not configured.');
  return collection(firestoreDb, 'users', userId, 'tasks');
}

/** All documents are scoped below the authenticated user's UID. */
export const firestoreRepository: TaskRepository = {
  async list(userId) {
    const snapshot = await getDocs(taskCollection(userId));
    return snapshot.docs.map((item) => item.data() as Task);
  },
  async save(task) {
    await setDoc(doc(taskCollection(task.userId), task.id), task);
  },
  async remove(userId, taskId) {
    await deleteDoc(doc(taskCollection(userId), taskId));
  },
  async sync(userId, tasks) {
    const ref = taskCollection(userId);
    const snapshot = await getDocs(ref);
    const nextIds = new Set(tasks.map((task) => task.id));
    const batch = writeBatch(firestoreDb!);
    snapshot.docs.forEach((item) => { if (!nextIds.has(item.id)) batch.delete(item.ref); });
    tasks.forEach((task) => batch.set(doc(ref, task.id), task));
    await batch.commit();
  },
};
