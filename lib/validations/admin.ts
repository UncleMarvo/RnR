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

// Product schemas
export const createProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  imageUrl: z.string().url().optional().nullable(),
  imageKey: z.string().optional().nullable(),
})

export type CreateProductInput = z.input<typeof createProductSchema>

export const updateProductSchema = createProductSchema.partial().extend({
  oldImageKey: z.string().optional().nullable(),
})

export type UpdateProductInput = z.input<typeof updateProductSchema>

// Variant schemas
export const createVariantSchema = z.object({
  productId: z.string(),
  name: z.string().min(2, "Variant name must be at least 2 characters"),
  sku: z.string().min(2, "SKU must be at least 2 characters").regex(/^[A-Z0-9-]+$/i, "SKU must contain only letters, numbers, and hyphens"),
  flavour: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  price: z.number().min(0.01, "Price must be at least 0.01"),
  stockQty: z.number().int().min(0, "Stock quantity must be 0 or more"),
  lowStockThreshold: z.number().int().min(0).default(10),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
})

export type CreateVariantInput = z.input<typeof createVariantSchema>

export const updateVariantSchema = createVariantSchema
  .omit({ productId: true })
  .partial()

export type UpdateVariantInput = z.input<typeof updateVariantSchema>

// Invite schemas
export const createInviteSchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  expiryDays: z.number().int().min(1).max(90).default(14),
})

export type CreateInviteInput = z.infer<typeof createInviteSchema>

export const bulkInviteSchema = z.object({
  emails: z.array(z.string().email()).min(1).max(100),
  expiryDays: z.number().int().min(1).max(90).default(14),
})

export type BulkInviteInput = z.infer<typeof bulkInviteSchema>
