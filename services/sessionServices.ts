import { db } from '../lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { Session } from '../types';

export const getUserSessions = async (userId: string): Promise<Session[]> => {
  const q = query(collection(db, 'sessions'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Session));
};

// new delete session method
export const deleteSession = async (sessionId: string): Promise<void> => {
  const sessionRef = doc(db, 'sessions', sessionId);
  await deleteDoc(sessionRef);
};
