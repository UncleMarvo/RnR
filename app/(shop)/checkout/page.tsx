"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SessionProvider, useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { StripeProvider } from "@/components/shop/StripeProvider"
import { CheckoutForm } from "@/components/shop/CheckoutForm"
import { useHydratedCart } from "@/hooks/useHydratedCart"
import { formatPrice, calculateDiscount } from "@/lib/utils"
import { addressSchema, type AddressFormData } from "@/lib/validations/checkout"

interface ClubInfo {
  clubName: string
  discountEnabled: boolean
  discountPercentage: number
  clubAddress: {
    line1: string
    city: string
    eircode: string | null
    country: string
  }
}

interface SavedAddress {
  id: string
  label: string | null
  firstName: string
  lastName: string
  line1: string
  line2: string | null
  city: string
  county: string | null
  eircode: string | null
  country: string
  isDefault: boolean
}

export default function CheckoutPage() {
  return (
    <SessionProvider>
      <CheckoutContent />
    </SessionProvider>
  )
}

function CheckoutContent() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const { items, subtotal, isHydrated } = useHydratedCart()

  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null)
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [saveAddress, setSaveAddress] = useState(true)

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderTotal, setOrderTotal] = useState(0)
  const [orderSubtotal, setOrderSubtotal] = useState(0)
  const [orderDiscount, setOrderDiscount] = useState(0)
  const [orderDiscountPct, setOrderDiscountPct] = useState(0)
  const [creatingIntent, setCreatingIntent] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      line1: "",
      line2: "",
      city: "",
      county: "",
      eircode: "",
      country: "IE",
    },
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login?callbackUrl=/checkout")
    }
  }, [sessionStatus, router])

  // Redirect if cart is empty (wait for hydration)
  useEffect(() => {
    if (sessionStatus === "authenticated" && isHydrated && items.length === 0) {
      router.push("/cart")
    }
  }, [sessionStatus, isHydrated, items.length, router])

  // Fetch club info or addresses
  useEffect(() => {
    if (sessionStatus !== "authenticated") return

    async function loadData() {
      setPageLoading(true)
      try {
        if (session?.user?.role === "CLUB_MEMBER") {
          const res = await fetch("/api/clubs/my-settings")
          const data = await res.json()
          if (!data.error) setClubInfo(data)
        } else {
          const res = await fetch("/api/addresses")
          const data = await res.json()
          if (data.addresses) {
            setAddresses(data.addresses)
            const defaultAddr = data.addresses.find(
              (a: SavedAddress) => a.isDefault
            )
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id)
            } else if (data.addresses.length > 0) {
              setSelectedAddressId(data.addresses[0].id)
            } else {
              setShowAddressForm(true)
            }
          }
        }
      } catch {
        toast.error("Failed to load checkout data")
      } finally {
        setPageLoading(false)
      }
    }

    loadData()
  }, [sessionStatus, session?.user?.role])

  const discountPercentage =
    clubInfo?.discountEnabled ? clubInfo.discountPercentage : 0
  const { discountAmount, finalPrice } = calculateDiscount(
    subtotal,
    discountPercentage
  )

  async function handleCreatePaymentIntent() {
    setCreatingIntent(true)

    // If PUBLIC user with new address, save it first
    if (
      session?.user?.role !== "CLUB_MEMBER" &&
      showAddressForm &&
      saveAddress
    ) {
      const valid = await form.trigger()
      if (!valid) {
        setCreatingIntent(false)
        return
      }
      const addressData = form.getValues()
      try {
        const res = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...addressData, isDefault: true }),
        })
        const data = await res.json()
        if (data.error) {
          toast.error(data.error)
          setCreatingIntent(false)
          return
        }
        setSelectedAddressId(data.address.id)
        setAddresses((prev) => [...prev, data.address])
        setShowAddressForm(false)
      } catch {
        toast.error("Failed to save address")
        setCreatingIntent(false)
        return
      }
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      })

      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
        setCreatingIntent(false)
        return
      }

      setClientSecret(data.clientSecret)
      setOrderTotal(data.total)
      setOrderSubtotal(data.subtotal)
      setOrderDiscount(data.discountAmount)
      setOrderDiscountPct(data.discountPercentage)
    } catch {
      toast.error("Failed to create payment. Please try again.")
    } finally {
      setCreatingIntent(false)
    }
  }

  if (
    sessionStatus === "loading" ||
    pageLoading ||
    !isHydrated ||
    items.length === 0
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-zinc-100 sm:text-3xl">
        Checkout
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Left: Delivery + Payment */}
        <div className="space-y-8 lg:col-span-2">
          {/* Delivery Section */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-zinc-100">
              Delivery Address
            </h2>

            {session?.user?.role === "CLUB_MEMBER" && clubInfo ? (
              <div className="mt-4">
                <p className="text-sm text-zinc-300">
                  Your order will be delivered to{" "}
                  <span className="font-semibold">{clubInfo.clubName}</span>
                </p>
                <div className="mt-2 text-sm text-zinc-400">
                  <p>{clubInfo.clubAddress.line1}</p>
                  <p>{clubInfo.clubAddress.city}</p>
                  {clubInfo.clubAddress.eircode && (
                    <p>{clubInfo.clubAddress.eircode}</p>
                  )}
                  <p>{clubInfo.clubAddress.country}</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {addresses.length > 0 && !showAddressForm && (
                  <>
                    <select
                      value={selectedAddressId ?? ""}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
                    >
                      {addresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.label || `${addr.firstName} ${addr.lastName}`} —{" "}
                          {addr.line1}, {addr.city}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(true)}
                      className="text-sm text-zinc-400 hover:text-zinc-300 underline"
                    >
                      Add new address
                    </button>
                  </>
                )}

                {(showAddressForm || addresses.length === 0) && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-zinc-300">First Name</Label>
                        <Input
                          {...form.register("firstName")}
                          className="mt-1 border-zinc-700 bg-zinc-800 text-zinc-100"
                        />
                        {form.formState.errors.firstName && (
                          <p className="mt-1 text-xs text-red-500">
                            {form.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-zinc-300">Last Name</Label>
                        <Input
                          {...form.register("lastName")}
                          className="mt-1 border-zinc-700 bg-zinc-800 text-zinc-100"
                        />
                        {form.formState.errors.lastName && (
                          <p className="mt-1 text-xs text-red-500">
                            {form.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-zinc-300">Address Line 1</Label>
                      <Input
                        {...form.register("line1")}
                        className="mt-1 border-zinc-700 bg-zinc-800 text-zinc-100"
                      />
                      {form.formState.errors.line1 && (
                        <p className="mt-1 text-xs text-red-500">
                          {form.formState.errors.line1.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-zinc-300">
                        Address Line 2 (optional)
                      </Label>
                      <Input
                        {...form.register("line2")}
                        className="mt-1 border-zinc-700 bg-zinc-800 text-zinc-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-zinc-300">City</Label>
                        <Input
                          {...form.register("city")}
                          className="mt-1 border-zinc-700 bg-zinc-800 text-zinc-100"
                        />
                        {form.formState.errors.city && (
                          <p className="mt-1 text-xs text-red-500">
                            {form.formState.errors.city.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-zinc-300">
                          County (optional)
                        </Label>
                        <Input
                          {...form.register("county")}
                          className="mt-1 border-zinc-700 bg-zinc-800 text-zinc-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-zinc-300">
                          Eircode (optional)
                        </Label>
                        <Input
                          {...form.register("eircode")}
                          className="mt-1 border-zinc-700 bg-zinc-800 text-zinc-100"
                        />
                      </div>
                      <div>
                        <Label className="text-zinc-300">Country</Label>
                        <Input
                          {...form.register("country")}
                          className="mt-1 border-zinc-700 bg-zinc-800 text-zinc-100"
                          defaultValue="IE"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="saveAddress"
                        checked={saveAddress}
                        onCheckedChange={(checked) =>
                          setSaveAddress(checked === true)
                        }
                      />
                      <Label htmlFor="saveAddress" className="text-sm text-zinc-300">
                        Save this address
                      </Label>
                    </div>

                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="text-sm text-zinc-400 hover:text-zinc-300 underline"
                      >
                        Use saved address
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-zinc-100">Payment</h2>

            {clientSecret ? (
              <div className="mt-4">
                <StripeProvider clientSecret={clientSecret}>
                  <CheckoutForm
                    clientSecret={clientSecret}
                    total={orderTotal}
                  />
                </StripeProvider>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-zinc-400 mb-4">
                  Click below to proceed to payment.
                </p>
                <Button
                  onClick={handleCreatePaymentIntent}
                  disabled={creatingIntent}
                  className="w-full bg-white text-zinc-900 hover:bg-zinc-200"
                  size="lg"
                >
                  {creatingIntent ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing Payment...
                    </>
                  ) : (
                    `Pay ${formatPrice(finalPrice)}`
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-zinc-100">
              Order Summary
            </h2>

            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex justify-between text-sm"
                >
                  <span className="text-zinc-400">
                    {item.productName} — {item.variantName} x{item.quantity}
                  </span>
                  <span className="text-zinc-100">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}

              <div className="border-t border-zinc-800 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-zinc-100">
                    {formatPrice(clientSecret ? orderSubtotal : subtotal)}
                  </span>
                </div>

                {(clientSecret ? orderDiscountPct : discountPercentage) > 0 && (
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-green-400">
                      Club Discount (
                      {clientSecret ? orderDiscountPct : discountPercentage}%)
                    </span>
                    <span className="text-green-400">
                      -
                      {formatPrice(
                        clientSecret ? orderDiscount : discountAmount
                      )}
                    </span>
                  </div>
                )}

                <div className="mt-3 border-t border-zinc-800 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-zinc-100">Total</span>
                    <span className="font-semibold text-zinc-100">
                      {formatPrice(clientSecret ? orderTotal : finalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
