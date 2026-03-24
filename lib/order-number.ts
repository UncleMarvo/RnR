import { prisma } from "./prisma"

export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `RNR-${year}-`
  const count = await prisma.order.count({
    where: { orderNumber: { startsWith: prefix } },
  })
  const sequence = String(count + 1).padStart(4, "0")
  return `${prefix}${sequence}`
}
