import Stripe from 'stripe';

export const getStripeInstance = (): Stripe => {

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2025-07-30.basil',
    });

    return stripe;
}