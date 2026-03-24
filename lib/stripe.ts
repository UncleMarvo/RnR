import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
  typescript: true,
})

export async function createClubStripeAccount(club: {
  name: string
  contactEmail: string
  country: string
}) {
  return stripe.accounts.create({
    type: "express",
    country: club.country,
    email: club.contactEmail,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_profile: { name: club.name },
  })
}

export async function createClubOnboardingLink(
  stripeAccountId: string,
  refreshUrl: string,
  returnUrl: string
) {
  return stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  })
}

export async function transferRevenueShare(
  amount: number,
  stripeAccountId: string,
  orderId: string,
  currency: string = "eur"
) {
  return stripe.transfers.create({
    amount,
    currency,
    destination: stripeAccountId,
    metadata: { orderId },
  })
}
