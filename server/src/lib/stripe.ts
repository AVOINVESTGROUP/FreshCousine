import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  console.warn('[Stripe] STRIPE_SECRET_KEY is not set. Checkout will use stubbed responses in local mode.');
}

export const stripe = secretKey
  ? new Stripe(secretKey, { apiVersion: '2022-11-15' })
  : null;

export function isStripeEnabled() {
  return Boolean(secretKey);
}
