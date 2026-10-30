import type { DemoUser } from '../types';

export const demoUser: DemoUser = {
  displayName: 'Tamer',
  email: 'demo@tamer-do-list.local',
  photoURL: '',
};

/** واجهة مؤقتة؛ ستُوصل بـ Firebase GoogleAuthProvider عند إدخال Firebase config. */
export async function signInWithGoogle(): Promise<DemoUser> {
  return demoUser;
}

export async function signOutUser(): Promise<void> {
  return Promise.resolve();
}
