"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface Props {
  clientSecret: string
  total: number
}

export function CheckoutForm({ clientSecret, total }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError("Card element not found")
      setProcessing(false)
      return
    }

    const { error: stripeError, paymentIntent } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      })

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.")
      setProcessing(false)
      return
    }

    if (paymentIntent?.status === "succeeded") {
      router.push(
        `/checkout/success?payment_intent=${paymentIntent.id}`
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#fafafa",
                "::placeholder": { color: "#71717a" },
              },
              invalid: { color: "#ef4444" },
            },
          }}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-white text-zinc-900 hover:bg-zinc-200"
        size="lg"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${formatPrice(total)}`
        )}
      </Button>
    </form>
  )
}
