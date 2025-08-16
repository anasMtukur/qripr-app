import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getStripeInstance } from '@/services/stripeService';

const stripe = getStripeInstance();

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return new Response('Missing Stripe signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const buf = await req.arrayBuffer();
    event = stripe.webhooks.constructEvent(
      Buffer.from(buf),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const amount_total = session.amount_total || 0;

    if (!userId) {
      console.error('No userId in session metadata');
      return new Response('No userId in metadata', { status: 400 });
    }

    try {
      // 1. Update user account to Pro
      const userRef = doc(db, 'accounts', userId);
      await updateDoc(userRef, {
        accountType: 'pro',
        proSince: new Date().toISOString(),
      });

      // 2. Record payment in payments collection
      const paymentRef = doc(db, 'payments', session.id);
      await setDoc(paymentRef, {
        userId,
        amount: amount_total / 100, // cents → currency units
        currency: session.currency,
        createdAt: serverTimestamp(),
        stripeSessionId: session.id,
        paymentStatus: session.payment_status,
      });

      console.log(`✅ Upgraded user ${userId} to Pro`);
    } catch (err) {
      console.error('Error updating Firestore after payment:', err);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  return new Response('Webhook received', { status: 200 });
}
