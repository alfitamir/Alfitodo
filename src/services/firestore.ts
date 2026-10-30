import type { Task } from '../types';

export interface TaskRepository {
  list(userId: string): Promise<Task[]>;
  save(task: Task): Promise<void>;
  remove(taskId: string): Promise<void>;
}

/**
 * نقطة توصيل مستقبلية إلى Cloud Firestore.
 * وضع Demo الحالي يستخدم localStorage حتى لا تتطلب الواجهة مفاتيح خارجية.
 */
export const firestoreRepository: TaskRepository = {
  async list() {
    return [];
  },
  async save() {
    return Promise.resolve();
  },
  async remove() {
    return Promise.resolve();
  },
};
