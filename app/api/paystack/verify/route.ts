import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { reference, userId } = await req.json();

    if (!reference || !userId) {
      return NextResponse.json({ error: 'Missing transaction reference or userId' }, { status: 400 });
    }

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // Keep secret key server-side
        'Content-Type': 'application/json',
      },
    });

    const data = await verifyRes.json();

    if (!verifyRes.ok) {
      return NextResponse.json({ error: 'Verification failed', details: data }, { status: 400 });
    }

    if (data.data.status === 'success') {
      return NextResponse.json({
        status: 'success',
        reference: data.data.reference,
        amount: data.data.amount / 100, // kobo → naira
        currency: data.data.currency,
        email: data.data.customer.email,
      });
    } else {
      return NextResponse.json({ status: 'failed', details: data.data });
    }
  } catch (error) {
    console.error('Paystack verification error:', error);
    return NextResponse.json({ error: 'Server error verifying payment' }, { status: 500 });
  }
}
