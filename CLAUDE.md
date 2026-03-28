# R+R — Claude Code Project Context

## What Is This Project?
R+R is a mobile-first PWA for sports supplement sales
built on a B2B2C model. Sports clubs are the primary
sales channel — club members purchase products and
orders are delivered to the club for distribution.
General public users can also purchase with home delivery.

## Project Location
`c:\WORK\R+R\rnr`

## Repository
https://github.com/UncleMarvo/RnR (branch: main)

## Live URL
https://rnr-production-0930.up.railway.app

## Architecture
This project is designed in a Claude.ai conversation
which generates prompts for Claude Code to execute.
Do not make architectural decisions unilaterally.

---

## Tech Stack (Locked)

| Layer | Choice |
|---|---|
| Framework | Next.js 16, App Router, TypeScript strict |
| Styling | Tailwind v4 |
| UI Components | shadcn/ui (new-york, zinc) |
| State | Zustand (with persist middleware) |
| Forms | React Hook Form + Zod |
| ORM | Prisma |
| Database | PostgreSQL on Railway |
| Auth | NextAuth v5 beta |
| Payments | Stripe + Stripe Connect |
| Email | Resend |
| File Storage | Cloudflare R2 (EU jurisdiction) |
| Hosting | Railway (Nixpacks) |
| Toasts | sonner (NOT deprecated shadcn toast) |

---

## User Roles

| Role | Description |
|---|---|
| SUPER_ADMIN | Full platform access, impersonates Club Admins |
| CLUB_ADMIN | Manages club, members, invites, views orders |
| CLUB_MEMBER | Registered via invite, orders ship to club |
| PUBLIC | Self-registered, orders ship to home address |

---

## Key Business Rules
- Club discounts applied at checkout ONLY — never
  shown on product listing or detail pages
- Discount % configurable per club (ClubSettings)
- Revenue share configurable per club (on/off + %)
- Minimum order configurable globally and per club
- CLUB_MEMBER orders: DeliveryType.CLUB (to club address)
- PUBLIC orders: DeliveryType.HOME (to home address)
- Super Admin impersonates Club Admin via httpOnly
  cookie (rnr-impersonating) — all actions audit logged
- Order numbers: RNR-YYYY-XXXX (e.g. RNR-2026-0001)
- All prices EUR at launch, multi-currency in schema
- Stripe Connect handles revenue share payouts
- Club Admins created by Super Admin only — temp
  password generated, email sent, mustChangePassword
  flag forces change on first login

---

## Database (Railway PostgreSQL)

**Host:** centerbeam.proxy.rlwy.net:29399/railway

### Models
User, Session, Club, ClubSettings, ClubAdmin,
ClubMember, Invite, Product, ProductVariant,
Address, Order, OrderItem, Shipment, RevenueShare,
Refund, StockMovement, AuditLog, GlobalSettings

### Enums
UserRole, OrderStatus, DeliveryType, InviteStatus,
RevenueShareStatus, ShipmentStatus, StockMovementType

### Important Schema Notes
- User.mustChangePassword — forced change on first login
- User.passwordResetToken + passwordResetExpiry
- All monetary values: Decimal @db.Decimal(10,2)
- Prisma Decimal NOT JSON serialisable — always convert
  with .toNumber() or JSON.parse(JSON.stringify())
- Zustand subtotal/totalItems computed in
  useHydratedCart hook NOT as store getters
  (getters don't survive Zustand persist rehydration)

### Seed Data
- Super Admin: admin@rnr.ie / Admin1234!
- Club: Sample FC (slug: sample-fc), 10% discount
- Products: Whey Protein (3 variants), Creatine (1 variant)

### DB Scripts
```bash
npm run db:migrate    # prisma migrate dev
npm run db:push       # prisma db push (avoid on prod)
npm run db:seed       # tsx prisma/seed.ts
npm run db:studio     # prisma studio
npm run db:generate   # prisma generate
```

### ⚠️ Production Migration Warning
NEVER use prisma db push on production — it bypasses
_prisma_migrations and causes P3009 errors on deploy.
Always use npm run db:migrate locally.

If P3009 occurs in Railway: use pgAdmin to DELETE the
stuck migration row from _prisma_migrations, then
INSERT it back with finished_at = NOW() and
applied_steps_count = 1, then trigger redeploy.

---

## Environment Variables
```
DATABASE_URL                          # Railway PostgreSQL
NEXTAUTH_SECRET                       # JWT signing secret
NEXTAUTH_URL                          # https://railway-url
STRIPE_SECRET_KEY                     # sk_test_... or sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY    # pk_test_... or pk_live_...
STRIPE_WEBHOOK_SECRET                 # whsec_... (per environment)
STRIPE_PLATFORM_ACCOUNT_ID           # acct_...
R2_ACCOUNT_ID                         # Cloudflare account ID
R2_ACCESS_KEY_ID                      # 32 chars exactly
R2_SECRET_ACCESS_KEY                  # 64 chars exactly
R2_BUCKET_NAME                        # rnr-assets
R2_PUBLIC_URL                         # https://pub-xxx.r2.dev
RESEND_API_KEY                        # re_...
RESEND_FROM_EMAIL                     # noreply@yourdomain.com
RESEND_FROM_NAME                      # R+R
NEXT_PUBLIC_APP_URL                   # https://railway-url
NEXT_PUBLIC_APP_NAME                  # R+R
```

### ⚠️ R2 Important Notes
- Bucket is EU jurisdiction — endpoint must be:
  https://[R2_ACCOUNT_ID].eu.r2.cloudflarestorage.com
- R2_ACCESS_KEY_ID must be exactly 32 chars
  (NOT the cfat_... API token — that's 53 chars)
- Images upload server-side via /api/admin/products/upload
  (browser never talks to R2 directly — no CORS needed)

### ⚠️ Stripe Webhook
- Each environment (test/live) needs its own webhook
  registered in Stripe dashboard with its own whsec_...
- Webhook URL: [APP_URL]/api/webhooks/stripe
- Events: payment_intent.succeeded,
  payment_intent.payment_failed

---

## Route Structure

### Public Shop (app/(shop)/)
```
/                          Product listing
/products/[slug]           Product detail
/cart                      Cart
/checkout                  Stripe checkout
/checkout/success          Order confirmed (polls for order)
/checkout/cancel           Payment cancelled
/privacy                   Privacy policy
```

### Auth (app/(auth)/)
```
/login                     All user types
/register                  Public self-registration
/invite/[token]            Club member invite registration
/forgot-password           Request reset email
/reset-password/[token]    Reset password
/change-password           Forced change (mustChangePassword)
```

### Account (app/(account)/)
```
/account                   Profile + data privacy
/account/orders            Order history
/account/orders/[id]       Order detail
/account/addresses         Addresses (PUBLIC only)
```

### Club Admin (app/(club-admin)/)
```
/club-admin/dashboard      Action-first dashboard
/club-admin/members        Member list
/club-admin/invites        Invite link + email invites
/club-admin/orders         Club orders (read only)
/club-admin/orders/[id]    Order detail
/club-admin/revenue        Revenue share history
/club-admin/settings       Read-only settings view
```

### Super Admin (app/(super-admin)/)
```
/super-admin/dashboard     Platform overview
/super-admin/clubs         All clubs
/super-admin/clubs/new     Create club → redirects to detail
/super-admin/clubs/[id]    Club detail + impersonate
/super-admin/clubs/[id]/settings  Club settings
/super-admin/products      Product management
/super-admin/products/new  Add product
/super-admin/products/[id] Edit product + variants
/super-admin/orders        All orders + refunds
/super-admin/stock         Stock levels + movements
/super-admin/users         All users
/super-admin/reports/sales Sales reports
/super-admin/reports/revenue-share  Revenue share
```

---

## Key Library Files

| File | Purpose |
|---|---|
| lib/auth.ts | NextAuth v5 — all 4 roles, mustChangePassword in JWT |
| lib/prisma.ts | Prisma client singleton |
| lib/stripe.ts | Stripe client + Connect helpers |
| lib/r2.ts | Cloudflare R2 — server-side upload only |
| lib/resend.ts | Resend email client |
| lib/utils.ts | cn(), formatPrice(), calculateDiscount(), slugify(), eurosToCents(), centsToEuros() |
| lib/temp-password.ts | Generates XXXX-XXXX-XXXX temp passwords |
| lib/club-context.ts | getClubContext() — resolves clubId for CLUB_ADMIN and impersonating SUPER_ADMIN |
| lib/order-number.ts | Generates RNR-YYYY-XXXX order numbers |
| lib/validations/auth.ts | Zod: login, register, invite, forgot/reset password |
| lib/validations/admin.ts | Zod: club, product, variant, invite, club admin schemas |
| lib/validations/account.ts | Zod: profile, password change, reset |
| lib/validations/checkout.ts | Zod: address, checkout items |
| middleware.ts | Route protection + mustChangePassword redirect + impersonation cookie check |
| stores/cartStore.ts | Zustand cart — items + actions only (NO getters) |
| hooks/useHydratedCart.ts | Computes totalItems + subtotal from items array |
| types/index.ts | ProductWithVariants, ProductVariant types |
| types/next-auth.d.ts | Session extensions: role, clubId, mustChangePassword etc. |

---

## Navigation Architecture

### Desktop (≥ md breakpoint)
- Shop: sticky top header with nav + cart + auth
- Club Admin: left sidebar (240px)
- Super Admin: left sidebar (240px)

### Mobile (< md breakpoint)
- Shop: minimal top bar (logo + cart) + bottom nav
  (Shop, Cart, Account)
- Club Admin: minimal top bar + bottom nav
  (Home, Members, Invites, Orders, More)
- Super Admin: minimal top bar + bottom nav
  (Home, Clubs, Orders, More)
- Auth pages: minimal header with "← Back to Shop"
- Bottom nav Account tab: BottomSheet with logout

### PWA
- manifest.json: standalone display, zinc-950 theme
- Service worker: network-first, offline fallback
- iOS: InstallBanner with Share → Add to Home Screen
- Android: beforeinstallprompt Install App button
- Icons: 192×192 and 512×512

---

## Middleware — Route Protection
```
/super-admin/*  → SUPER_ADMIN only
/club-admin/*   → CLUB_ADMIN or SUPER_ADMIN + impersonation cookie
/account/*      → any authenticated user
/checkout/*     → any authenticated user
/login, /register → redirect to dashboard if logged in
Any route → redirect to /change-password if mustChangePassword
```

---

## Impersonation Flow
1. Super Admin clicks Impersonate on club detail page
2. ImpersonateButton POSTs to /api/impersonate
3. httpOnly cookie set: rnr-impersonating = {clubId, clubName}
4. Redirect to /club-admin/dashboard
5. ImpersonationBanner shows amber bar at top
6. All club-admin API routes read club context from cookie
7. AuditLog entry written (IMPERSONATE_START)
8. Stop: POST /api/impersonate/stop → clears cookie →
   redirect to /super-admin/dashboard (IMPERSONATE_STOP)

---

## Club Admin Creation Flow
1. Super Admin → Club detail → Admins tab
2. CreateClubAdminForm: firstName, lastName, email
3. POST /api/admin/clubs/[id]/admins/create
4. Temp password generated (XXXX-XXXX-XXXX format)
5. User created: role CLUB_ADMIN, mustChangePassword: true
6. ClubAdmin record created
7. Resend invite email with temp password
8. AuditLog entry (CREATE_CLUB_ADMIN)
9. First login → middleware → /change-password
10. New password set → signOut → /login?message=password-changed
11. Login with new password → /club-admin/dashboard

---

## Stripe + Order Flow
1. POST /api/checkout — validates stock, applies discount,
   creates Stripe Payment Intent
2. Client confirms payment via Stripe Elements
3. Redirect to /checkout/success?payment_intent=pi_xxx
4. Success page polls /api/orders?paymentIntentId=pi_xxx
   (up to 10 attempts, 1s apart — webhook timing gap)
5. Stripe fires payment_intent.succeeded to webhook
6. POST /api/webhooks/stripe (raw body, sig verified):
   - Creates Order + OrderItems
   - Decrements stock (StockMovements)
   - Creates RevenueShare if enabled
   - Creates Shipment (PENDING)
7. Polling finds order → shows order number → clears cart

---

## Build Status

| Phase | Status |
|---|---|
| Foundation + Auth | ✅ Complete |
| Shop UI + Cart + Checkout + Stripe | ✅ Complete |
| Super Admin (all sections) | ✅ Complete |
| Club Admin (all sections) | ✅ Complete |
| Account pages + Password reset | ✅ Complete |
| PWA + GDPR | ✅ Complete |
| Club Admin Creation Flow | ✅ Complete |
| Mobile Native Feel | ✅ Complete |
| Railway Deployment | ✅ Live |
| Full E2E Test | ✅ Passed |
| Custom Domain | 🔲 Pending client |
| Production Stripe keys | 🔲 Pending go-live |
| Resend verified domain | 🔲 Pending domain |

---

## Known Deferred Items
- Middleware proxy migration (Next.js 16 deprecation warning)
- Password reset page needs testing on production
- Export CSV for club members (placeholder — "Coming soon")
- Revenue share email notifications
- Order status email notifications to members
- PWA install onboarding — guided install flow for
  non-technical users (invite landing page + Club Admin
  shareable WhatsApp message with step-by-step install
  instructions). Pending client decision on approach.

---

## Coding Conventions
- "use client" only where strictly necessary
- Server components for page shells + data fetching
- Direct Prisma calls in server components
- API routes for client-side mutations only
- Forms: React Hook Form + Zod via zodResolver
- Toasts: sonner — import { toast } from "sonner"
- Decimal serialisation: always before client props
- Stripe: always work in cents (eurosToCents/centsToEuros)
- Error responses: { error: string } + HTTP status
- Success responses: { success: true, ...data }
- export const dynamic = 'force-dynamic' on all pages
  and API routes (required for Railway deployment)

---

## Deployment (Railway)
- Nixpacks auto-detects Next.js
- nixpacks.toml forces nodejs_20
- Start: npx prisma migrate deploy && npx next start
- Health check: /api/health (instant 200, no DB call)
- Healthcheck timeout: 300s
- Auto-deploys on push to main branch

---

*Last updated: Full E2E test passed — pending domain + go-live*
*Repo: https://github.com/UncleMarvo/RnR*
