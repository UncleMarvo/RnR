import { PrismaClient, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding R+R database...")

  const passwordHash = await bcrypt.hash("Admin1234!", 12)

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@rnr.ie" },
    update: {},
    create: {
      email: "admin@rnr.ie",
      firstName: "Super",
      lastName: "Admin",
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      emailVerified: new Date(),
    },
  })
  console.log("✅ Super Admin:", superAdmin.email)

  await prisma.globalSettings.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      minimumOrderEnabled: false,
      minimumOrderAmount: 0,
      currency: "EUR",
      maintenanceMode: false,
    },
  })
  console.log("✅ Global settings created")

  const club = await prisma.club.upsert({
    where: { slug: "sample-fc" },
    update: {},
    create: {
      name: "Sample FC",
      slug: "sample-fc",
      addressLine1: "1 Main Street",
      city: "Dublin",
      county: "Dublin",
      eircode: "D01 AB12",
      country: "IE",
      contactFirstName: "John",
      contactLastName: "Smith",
      contactEmail: "john@samplefc.ie",
      settings: {
        create: {
          discountEnabled: true,
          discountPercentage: 10,
          revenueShareEnabled: false,
          revenueSharePercentage: 5,
          minimumOrderEnabled: false,
          minimumOrderAmount: 0,
        },
      },
    },
  })
  console.log("✅ Club created:", club.name)

  await prisma.product.upsert({
    where: { slug: "whey-protein" },
    update: {},
    create: {
      name: "Whey Protein",
      slug: "whey-protein",
      description: "Premium whey protein concentrate. 24g protein per serving.",
      isActive: true,
      sortOrder: 1,
      variants: {
        create: [
          {
            name: "Chocolate 1kg",
            sku: "WP-CHOC-1KG",
            flavour: "Chocolate",
            size: "1kg",
            price: 34.99,
            stockQty: 50,
            isActive: true,
            sortOrder: 1,
          },
          {
            name: "Vanilla 1kg",
            sku: "WP-VAN-1KG",
            flavour: "Vanilla",
            size: "1kg",
            price: 34.99,
            stockQty: 40,
            isActive: true,
            sortOrder: 2,
          },
          {
            name: "Chocolate 2kg",
            sku: "WP-CHOC-2KG",
            flavour: "Chocolate",
            size: "2kg",
            price: 59.99,
            stockQty: 25,
            isActive: true,
            sortOrder: 3,
          },
        ],
      },
    },
  })

  await prisma.product.upsert({
    where: { slug: "creatine-monohydrate" },
    update: {},
    create: {
      name: "Creatine Monohydrate",
      slug: "creatine-monohydrate",
      description: "Pure micronised creatine monohydrate.",
      isActive: true,
      sortOrder: 2,
      variants: {
        create: [
          {
            name: "Unflavoured 500g",
            sku: "CR-UNFL-500G",
            flavour: "Unflavoured",
            size: "500g",
            price: 19.99,
            stockQty: 60,
            isActive: true,
            sortOrder: 1,
          },
        ],
      },
    },
  })
  console.log("✅ Products created")

  console.log("\n🎉 Seed complete!")
  console.log("Super Admin → admin@rnr.ie / Admin1234!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
