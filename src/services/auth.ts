import type { DemoUser } from '../types';

const SESSION_KEY = 'tamer-do-list.session.v1';

export const demoUser: DemoUser = {
  displayName: 'Tamer',
  email: 'demo@tamer-do-list.local',
  photoURL: '',
};

/** واجهة مؤقتة؛ ستُوصل بـ Firebase GoogleAuthProvider عند إدخال Firebase config. */
export function hasStoredSession(): boolean {
  try {
    return localStorage.getItem(SESSION_KEY) !== 'signed-out';
  } catch {
    return true;
  }
}

export async function signInWithGoogle(): Promise<DemoUser> {
  try {
    localStorage.setItem(SESSION_KEY, 'active');
  } catch {
    // Keep the in-memory session when browser storage is unavailable.
  }
  return demoUser;
}

export async function signOutUser(): Promise<void> {
  try {
    localStorage.setItem(SESSION_KEY, 'signed-out');
  } catch {
    // The in-memory UI still signs out when browser storage is unavailable.
  }
}
