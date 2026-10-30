import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import type { Task } from '../types';
import { firestoreDb } from './firebase';

export interface TaskRepository {
  list(userId: string): Promise<Task[]>;
  save(task: Task): Promise<void>;
  remove(userId: string, taskId: string): Promise<void>;
}

function taskCollection(userId: string) {
  if (!firestoreDb) throw new Error('Firestore is not configured.');
  return collection(firestoreDb, 'users', userId, 'tasks');
}

/** User-scoped Firestore repository. Security Rules must enforce the same UID boundary. */
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
};
