import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider, type User } from 'firebase/auth';
import type { DemoUser } from '../types';
import { firebaseAuth, isFirebaseConfigured } from './firebase';

const SESSION_KEY = 'tamer-do-list.session.v1';

export const demoUser: DemoUser = {
  uid: 'demo-user',
  displayName: 'Tamer',
  email: 'demo@tamer-do-list.local',
  photoURL: '',
  isDemo: true,
};

function mapFirebaseUser(user: User): DemoUser {
  return {
    uid: user.uid,
    displayName: user.displayName ?? user.email ?? 'User',
    email: user.email ?? '',
    photoURL: user.photoURL ?? '',
  };
}

export function hasStoredSession(): boolean {
  try {
    return localStorage.getItem(SESSION_KEY) === 'active';
  } catch {
    return false;
  }
}

export function subscribeToAuth(callback: (user: DemoUser | null) => void): () => void {
  if (firebaseAuth) return onAuthStateChanged(firebaseAuth, (user) => callback(user ? mapFirebaseUser(user) : null));
  callback(hasStoredSession() ? demoUser : null);
  return () => undefined;
}

export async function signInWithGoogle(): Promise<DemoUser> {
  if (!firebaseAuth || !isFirebaseConfigured) throw new Error('Firebase is not configured. Use Demo mode or configure Firebase environment variables.');
  const result = await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
  return mapFirebaseUser(result.user);
}

export async function signInDemo(): Promise<DemoUser> {
  try { localStorage.setItem(SESSION_KEY, 'active'); } catch { /* In-memory demo remains available. */ }
  return demoUser;
}

export async function signOutUser(): Promise<void> {
  if (firebaseAuth?.currentUser) await signOut(firebaseAuth);
  try { localStorage.removeItem(SESSION_KEY); } catch { /* Ignore unavailable storage. */ }
}
