"use client"

import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

export function StripeProvider({
  children,
  clientSecret,
}: {
  children: React.ReactNode
  clientSecret: string
}) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#ffffff",
            colorBackground: "#18181b",
            colorText: "#fafafa",
            colorDanger: "#ef4444",
            borderRadius: "8px",
          },
        },
      }}
    >
      {children}
    </Elements>
  )
}
