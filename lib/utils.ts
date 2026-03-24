import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(
  amount: number | string,
  currency: string = "EUR"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
  }).format(num)
}

export function calculateDiscount(
  price: number,
  discountPercentage: number
): { discountAmount: number; finalPrice: number } {
  const discountAmount = (price * discountPercentage) / 100
  const finalPrice = price - discountAmount
  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export function eurosToCents(euros: number | string): number {
  const amount = typeof euros === "string" ? parseFloat(euros) : euros
  return Math.round(amount * 100)
}

export function centsToEuros(cents: number): number {
  return cents / 100
}
