import { getStripeInstance } from '@/services/stripeService';
import { NextResponse } from 'next/server';

const stripe = getStripeInstance();

export async function POST(req: Request) {

  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing transaction reference or userId' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Qripr Pro Subscription (Lifetime)',
            },
            unit_amount: 4999, // $49.99 — change if needed
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?upgrade=cancelled`,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    console.error('Error creating checkout session:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
