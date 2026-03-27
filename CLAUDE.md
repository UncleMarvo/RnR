# R+R — Claude Code Project Context

## What Is This Project?
R+R is a mobile-first PWA for sports supplement sales built on a
B2B2C model. Sports clubs are the primary sales channel — club members
purchase products and orders are delivered to the club for distribution.
General public users can also purchase with home delivery.

## Project Location
`c:\WORK\R+R\rnr`

## Architecture: This Chat Drives, Claude Code Builds
This project is designed and architected in a separate Claude.ai
conversation which generates precise prompts for Claude Code to execute.
Do not make architectural decisions unilaterally — implement what the
prompts specify and flag any conflicts or issues clearly.

---

## Tech Stack (Locked — Do Not Change Without Instruction)

| Layer | Choice |
|---|---|
| Framework | Next.js 16, App Router, TypeScript strict |
| Styling | Tailwind v4 |
| UI Components | shadcn/ui (new-york style, zinc base) |
| State | Zustand |
| Forms | React Hook Form + Zod |
| ORM | Prisma |
| Database | PostgreSQL on Railway |
| Auth | NextAuth v5 beta |
| Payments | Stripe + Stripe Connect |
| Email | Resend |
| File Storage | Cloudflare R2 (S3-compatible via @aws-sdk/client-s3) |
| Hosting | Railway (Nixpacks) |
| Toasts | sonner (NOT the deprecated shadcn toast) |

---

## User Roles

| Role | Description |
|---|---|
| SUPER_ADMIN | Full platform access, can impersonate any Club Admin |
| CLUB_ADMIN | Manages their club, members, invites, sees club orders |
| CLUB_MEMBER | Registered via invite token, orders ship to club address |
| PUBLIC | Self-registered, orders ship to home address |

---

## Key Business Rules
- Club discounts are applied at checkout only — NEVER shown on
  product listing or product detail pages
- Discount % is configurable per club (ClubSettings.discountPercentage)
- Revenue share is configurable per club, on/off toggle
  (ClubSettings.revenueShareEnabled + revenueSharePercentage)
- Minimum order is configurable globally and per club
- Club members' orders always use DeliveryType.CLUB (ship to club address)
- Public users' orders always use DeliveryType.HOME (ship to address)
- Super Admin can impersonate any Club Admin — all impersonation
  actions are written to AuditLog
- Order numbers format: RNR-YYYY-XXXX (e.g. RNR-2026-0001)
- All prices in EUR at launch, multi-currency architected in schema
- Stripe Connect handles revenue share payouts to clubs automatically

---

## Database (Railway PostgreSQL)

**Connection:** Set in .env.local as DATABASE_URL
**Host:** centerbeam.proxy.rlwy.net:29399/railway

### Models (prisma/schema.prisma)
User, Session, Club, ClubSettings, ClubAdmin, ClubMember, Invite,
Product, ProductVariant, Address, Order, OrderItem, Shipment,
RevenueShare, Refund, StockMovement, AuditLog, GlobalSettings

### Enums
UserRole, OrderStatus, DeliveryType, InviteStatus,
RevenueShareStatus, ShipmentStatus, StockMovementType

### Important Schema Notes
- User has passwordResetToken (String? @unique) and
  passwordResetExpiry (DateTime?) for password reset flow
- All monetary values use Decimal @db.Decimal(10,2) or @db.Decimal(5,2)
- Prisma Decimal type is NOT JSON serialisable — always convert to
  number with .toNumber() or JSON.parse(JSON.stringify()) before
  passing to client components

### Seed Data (already in DB)
- Super Admin: admin@rnr.ie / Admin1234!
- Club: Sample FC (slug: sample-fc), 10% discount enabled
- Products: Whey Protein (3 variants), Creatine Monohydrate (1 variant)

### DB Scripts
```bash
npm run db:migrate    # prisma migrate dev
npm run db:push       # prisma db push (schema changes without migration)
npm run db:seed       # tsx prisma/seed.ts
npm run db:studio     # prisma studio
npm run db:generate   # prisma generate
```

---

## Environment Variables (.env.local)
```
DATABASE_URL              # Railway PostgreSQL connection string
NEXTAUTH_SECRET           # Random secret for JWT signing
NEXTAUTH_URL              # App URL (http://localhost:3000 in dev)
STRIPE_SECRET_KEY         # Stripe secret key (sk_test_... in dev)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  # Stripe publishable key
STRIPE_WEBHOOK_SECRET     # Stripe webhook signing secret
STRIPE_PLATFORM_ACCOUNT_ID         # Platform Stripe account ID
R2_ACCOUNT_ID             # Cloudflare account ID
R2_ACCESS_KEY_ID          # R2 access key
R2_SECRET_ACCESS_KEY      # R2 secret key
R2_BUCKET_NAME            # R2 bucket name (rnr-assets)
R2_PUBLIC_URL             # Public URL for R2 bucket
RESEND_API_KEY            # Resend API key
RESEND_FROM_EMAIL         # Sender email address
RESEND_FROM_NAME          # Sender name (R+R)
NEXT_PUBLIC_APP_URL       # App URL for client-side use
NEXT_PUBLIC_APP_NAME      # App name (R+R)
```

---

## Route Structure

### Public / Shop (app/(shop)/)
```
/                          Product listing (homepage)
/products/[slug]           Product detail + variant selector
/cart                      Cart page
/checkout                  Checkout (Stripe)
/checkout/success          Order confirmed
/checkout/cancel           Payment cancelled
```

### Auth (app/(auth)/)
```
/login                     All user types
/register                  Public user self-registration
/invite/[token]            Club member invite registration
/forgot-password           Request password reset email
/reset-password/[token]    Reset password (not yet built)
```

### Account (app/(account)/)
```
/account                   Profile overview
/account/orders            Order history
/account/orders/[id]       Order detail
/account/addresses         Saved addresses (PUBLIC users)
```

### Club Admin (app/(club-admin)/)
```
/club-admin/dashboard      Overview
/club-admin/members        Member list
/club-admin/invites        Manage invites
/club-admin/invites/new    Send invites
/club-admin/orders         Club orders
/club-admin/orders/[id]    Order detail
/club-admin/revenue        Revenue share history
/club-admin/settings       Club settings
```

### Super Admin (app/(super-admin)/)
```
/super-admin/dashboard     Platform overview
/super-admin/clubs         All clubs
/super-admin/clubs/new     Create club
/super-admin/clubs/[id]    Club detail + impersonate
/super-admin/products      Product management
/super-admin/products/new  Add product
/super-admin/products/[id] Edit product + variants
/super-admin/orders        All orders
/super-admin/orders/[id]   Order detail + refund
/super-admin/stock         Stock levels + movements
/super-admin/users         All users
/super-admin/reports/sales Sales reports
/super-admin/reports/revenue-share  Revenue share report
```

### API Routes (app/api/)
```
/api/health                        GET — Railway health check
/api/auth/[...nextauth]            NextAuth handler
/api/auth/register                 POST — public registration
/api/auth/invite/[token]           GET validate, POST claim
/api/auth/forgot-password          POST — send reset email
/api/products                      GET — all active products
/api/products/[slug]               GET — single product
/api/clubs/my-settings             GET — club discount + address (CLUB_MEMBER)
/api/addresses                     GET + POST — saved addresses
/api/checkout                      POST — create Stripe Payment Intent
/api/webhooks/stripe               POST — Stripe webhook handler
/api/orders                        GET — orders (role-based)
/api/orders/[id]                   GET — single order with items
```

---

## Key Library Files

| File | Purpose |
|---|---|
| lib/auth.ts | NextAuth v5 config, all 4 roles, JWT callbacks |
| lib/prisma.ts | Prisma client singleton (dev-safe) |
| lib/stripe.ts | Stripe client, Connect helpers, transfer functions |
| lib/r2.ts | Cloudflare R2 upload, delete, presigned URL helpers |
| lib/resend.ts | Resend email client singleton |
| lib/utils.ts | cn(), formatPrice(), calculateDiscount(), slugify(), eurosToCents(), centsToEuros() |
| lib/validations/auth.ts | Zod schemas: login, register, inviteRegister, forgotPassword |
| middleware.ts | Route protection by role, redirect logic |
| types/index.ts | Shared TypeScript types (ProductWithVariants etc.) |
| types/next-auth.d.ts | NextAuth session type extensions |
| stores/cartStore.ts | Zustand cart store with localStorage persistence |

---

## Middleware — Route Protection
Defined in middleware.ts:
- /super-admin/* → SUPER_ADMIN only
- /club-admin/* → SUPER_ADMIN or CLUB_ADMIN
- /account/* → any authenticated user
- /checkout/* → any authenticated user
- /login, /register → redirect to dashboard if already logged in

---

## Build Status

| Phase | Status |
|---|---|
| Foundation + Auth | ✅ Complete |
| Shop UI + Cart + Checkout + Stripe | ✅ Complete |
| Super Admin (all sections) | ✅ Complete |
| Club Admin (all sections) | ✅ Complete |
| Account pages + Password reset | ✅ Complete |
| PWA manifest + service worker | ✅ Complete |
| GDPR compliance | ✅ Complete |
| Deploy to Railway | 🔲 Next |

---

## Known Issues / Deferred Items
- Next.js 16 warns middleware.ts is deprecated in favour of proxy
  convention — still works, migrate before production
- Password reset page (/reset-password/[token]) not yet built —
  forgot-password sends the email with the link, page is pending
- Resend requires real API key in .env.local for emails to send in dev
- Auto-login after registration (signIn() post-register API call) —
  verify runtime behaviour, may need workaround with NextAuth v5 beta

## ⚠️ Production Migration Warning

### Never use `prisma db push` on production
Early in development `prisma db push` was used to sync
schema changes directly to the Railway PostgreSQL database.
This bypasses the `_prisma_migrations` table and causes
conflicts when `prisma migrate deploy` runs on deployment.

### Symptom
Railway deployment fails with:
`Error: P3009 — migrate found failed migrations`
Column already exists error in the logs.

### Fix (run in pgAdmin each time)
1. DELETE the stuck migration record
2. INSERT it back with finished_at = NOW() and
   applied_steps_count = 1
3. Trigger redeploy with empty git commit

### Going Forward
Always use `npm run db:migrate` locally to create migrations.
Never use `prisma db push` on any environment.

---

## Coding Conventions
- Use "use client" only where strictly necessary
- Server components for all page shells and data fetching
- Direct Prisma calls in server components (not via API fetch)
- API routes used for client-side mutations only
- All forms: React Hook Form + Zod via zodResolver
- Toasts: sonner (import from "sonner")
- Always handle Prisma Decimal serialisation before returning from APIs
- Monetary calculations: always work in cents (integers) when
  interfacing with Stripe, convert with eurosToCents() / centsToEuros()
- Error responses: { error: string } with appropriate HTTP status
- Success responses: { success: true, ...data }

---

## Deployment (Railway)
- railway.json at project root configures Nixpacks build
- Start command: npx prisma migrate deploy && node server.js
- Health check: GET /api/health → { status: "ok" }
- All env vars set in Railway dashboard for production

---

## New Routes Added (post-initial-build)

### Account
```
/account                   Profile + data privacy section
/account/orders            Order history
/account/orders/[id]       Order detail
/account/addresses         Saved addresses (PUBLIC only)
```

### Auth
```
/reset-password/[token]    Password reset (token from email)
```

### Shop
```
/privacy                   GDPR privacy policy
```

### API — Account
```
/api/account/profile       GET + PATCH profile
/api/account/change-password  POST change password
/api/account/addresses/[id]   PUT + DELETE address
/api/account/export        GET — JSON data export download
/api/account/delete        POST — soft delete with password
```

### API — Auth
```
/api/auth/reset-password   POST — validate token + update hash
```

### PWA
```
/manifest.json             PWA manifest
/sw.js                     Service worker
/icons/icon-192.png        PWA icon 192×192
/icons/icon-512.png        PWA icon 512×512
```

---

*Last updated: All features complete — ready for Railway deployment*
*Repo: https://github.com/UncleMarvo/RnR*
