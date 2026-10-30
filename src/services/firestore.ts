import { collection, deleteDoc, doc, getDocs, setDoc, writeBatch, type DocumentData } from 'firebase/firestore';
import type { Task } from '../types';
import { firestoreDb } from './firebase';

export interface TaskRepository {
  list(userId: string): Promise<Task[]>;
  save(task: Task): Promise<void>;
  remove(userId: string, taskId: string): Promise<void>;
  sync(userId: string, previousTasks: Task[], nextTasks: Task[]): Promise<void>;
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
  async sync(userId, previousTasks, nextTasks) {
    const previous = syncQueues.get(userId) ?? Promise.resolve();
    const operation = previous.catch(() => undefined).then(async () => {
      const oldById = new Map(previousTasks.map((task) => [task.id, task]));
      const nextById = new Map(nextTasks.map((task) => [task.id, task]));
      const writes: Array<
        { kind: 'delete'; ref: ReturnType<typeof doc> }
        | { kind: 'set'; ref: ReturnType<typeof doc>; data: DocumentData }
      > = [];

      // Delete only documents this client previously loaded. Never sweep unknown
      // documents created by another browser/device after this client's snapshot.
      previousTasks.forEach((task) => {
        if (!nextById.has(task.id)) writes.push({ kind: 'delete', ref: doc(taskCollection(userId), task.id) });
      });
      nextTasks.forEach((task) => {
        const old = oldById.get(task.id);
        if (!old || JSON.stringify(old) !== JSON.stringify(task)) {
          writes.push({ kind: 'set', ref: doc(taskCollection(userId), task.id), data: task as unknown as DocumentData });
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
