import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const getAccountById = async (id: string) => {
  const ref = doc(db, 'accounts', id);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

export const createAccount = async (account: { id: string; name: string; email: string; accountType: string; createdAt: Date }) => {
  const ref = doc(db, 'accounts', account.id);
  await setDoc(ref, account);
  return account;
};

export async function updateAccount(userId: string, updates: Record<string, any>) {
  const ref = doc(db, 'accounts', userId);
  await updateDoc(ref, updates);
}
