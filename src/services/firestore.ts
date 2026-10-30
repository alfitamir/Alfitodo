import { collection, deleteDoc, doc, getDocs, setDoc, writeBatch, type DocumentData } from 'firebase/firestore';
import type { Task } from '../types';
import { firestoreDb } from './firebase';

export interface TaskRepository {
  list(userId: string): Promise<Task[]>;
  save(task: Task): Promise<void>;
  remove(userId: string, taskId: string): Promise<void>;
  sync(userId: string, tasks: Task[]): Promise<void>;
}

const syncQueues = new Map<string, Promise<void>>();

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
    const previous = syncQueues.get(userId) ?? Promise.resolve();
    const operation = previous.catch(() => undefined).then(async () => {
      const ref = taskCollection(userId);
      const snapshot = await getDocs(ref);
      const existing = new Map(snapshot.docs.map((item) => [item.id, item.data()]));
      const nextIds = new Set(tasks.map((task) => task.id));
      const writes: Array<{ kind: 'delete'; ref: typeof snapshot.docs[number]['ref'] } | { kind: 'set'; ref: ReturnType<typeof doc>; data: Task }> = [];

      snapshot.docs.forEach((item) => {
        if (!nextIds.has(item.id)) writes.push({ kind: 'delete', ref: item.ref });
      });
      tasks.forEach((task) => {
        const old = existing.get(task.id) as DocumentData | undefined;
        if (!old || JSON.stringify(old) !== JSON.stringify(task)) {
          writes.push({ kind: 'set', ref: doc(ref, task.id), data: task });
        }
      });

      // Firestore batches are limited to 500 writes. Keep a margin for future rule transforms.
      for (let offset = 0; offset < writes.length; offset += 450) {
        const batch = writeBatch(firestoreDb!);
        writes.slice(offset, offset + 450).forEach((write) => {
          if (write.kind === 'delete') batch.delete(write.ref);
          else batch.set(write.ref, write.data);
        });
        await batch.commit();
      }
    });
    syncQueues.set(userId, operation);
    try {
      await operation;
    } finally {
      if (syncQueues.get(userId) === operation) syncQueues.delete(userId);
    }
  },
};
