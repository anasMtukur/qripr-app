import { updateAccount } from './accountService';
import { addPaymentRecord } from './paymentService';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export const startStripePayment = async (user: any, account: any) => {
  if (!user || !account) return;

  const res = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.uid,
      email: account?.email,
    }),
  });

  const { sessionId } = await res.json();
  if (!sessionId) throw new Error('No sessionId returned');

  const stripe = await stripePromise;
  const { error } = await stripe!.redirectToCheckout({ sessionId });
  if (error) {
    console.error(error);
    alert('Failed to redirect to checkout.');
  }
};

export const startPaystackPayment = (user: any, account: any, router: any): any => {
  if (!user || !account) return;

  const paystack = (window as any).PaystackPop;
  if (!paystack || typeof paystack.setup !== 'function') {
    alert('Payment system is not ready yet. Please try again in a moment.');
    return;
  }

  const handler = paystack.setup({
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    email: account.email,
    amount: 500000, // in kobo (₦5,000)
    currency: 'NGN',
    callback: (response: any) => {
      // Ensure we handle async operations after payment
      (async () => {

        await updateAccount(user.uid, {
          accountType: 'pro',
          proSince: new Date(),
        });

        await addPaymentRecord({
          userId: user.uid,
          amount: 5000,
          currency: 'NGN',
          provider: 'paystack',
          transactionId: response.reference,
          status: 'success',
          createdAt: new Date(),
        });

        alert('Payment successful! Your account is now Pro.');
        router.refresh();
      })();
    },
    onClose: () => {
      alert('Payment window closed.');
    },
  });

  handler.openIframe();
};
