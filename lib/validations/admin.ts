import { z } from "zod"

export const createClubSchema = z.object({
  name: z.string().min(2, "Club name must be at least 2 characters"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  addressLine1: z.string().min(5, "Address must be at least 5 characters"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City must be at least 2 characters"),
  county: z.string().optional(),
  eircode: z.string().optional(),
  country: z.string().default("IE"),
  contactFirstName: z.string().min(2, "First name must be at least 2 characters"),
  contactLastName: z.string().min(2, "Last name must be at least 2 characters"),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().optional(),
})

export type CreateClubInput = z.input<typeof createClubSchema>

export const updateClubSchema = createClubSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type UpdateClubInput = z.infer<typeof updateClubSchema>

export const clubSettingsSchema = z.object({
  discountEnabled: z.boolean().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  revenueShareEnabled: z.boolean().optional(),
  revenueSharePercentage: z.number().min(0).max(100).optional(),
  minimumOrderEnabled: z.boolean().optional(),
  minimumOrderAmount: z.number().min(0).optional(),
})

export type ClubSettingsInput = z.infer<typeof clubSettingsSchema>
