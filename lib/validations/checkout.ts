import { z } from "zod"

export const addressSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  line1: z.string().min(5, "Address line 1 must be at least 5 characters"),
  line2: z.string().optional(),
  city: z.string().min(2, "City must be at least 2 characters"),
  county: z.string().optional(),
  eircode: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  isDefault: z.boolean().optional(),
  label: z.string().optional(),
})

export type AddressFormData = z.infer<typeof addressSchema>

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Cart must have at least one item"),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>
