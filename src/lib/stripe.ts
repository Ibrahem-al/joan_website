import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export const STRIPE_PRICES = {
  standard: process.env.STRIPE_STANDARD_PRICE_ID!,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID!,
}

export const CONNECT_ACCOUNT_ID = process.env.STRIPE_CONNECT_ACCOUNT_ID

/** Stripe Transfer options — routes money to partner's account if configured */
export function transferOptions() {
  if (!CONNECT_ACCOUNT_ID) return {}
  return {
    transfer_data: { destination: CONNECT_ACCOUNT_ID },
  }
}
