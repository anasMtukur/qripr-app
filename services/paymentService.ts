import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function addPaymentRecord(payment: {
  userId: string;
  amount: number;
  currency: string;
  provider: string;
  transactionId: string;
  status: string;
  createdAt?: Date;
}) {
  await addDoc(collection(db, 'payments'), {
    ...payment,
    createdAt: payment.createdAt || serverTimestamp(),
  });
}
