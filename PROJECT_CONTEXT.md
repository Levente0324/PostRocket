# PostRocket — Project Context

## Project Goal

PostRocket is an automated social media scheduling SaaS for Hungarian small businesses. Users write or AI-generate posts, schedule them to Facebook Pages and Instagram Business accounts, and PostRocket publishes them automatically via cron. Subscription tiers (Free / Pro / Elite) control active post limits and AI access.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.9
- **UI**: React 19, Tailwind CSS 4, shadcn/ui, Radix UI, Lucide icons, GSAP animations
- **Database / Auth / Storage**: Supabase (PostgreSQL with full RLS, email/password auth via `@supabase/ssr`, `post-media` storage bucket)
- **Payments**: Stripe v20 (Checkout Sessions, Customer Portal, Webhooks)
- **AI**: Google Gemini 2.5 Flash via `@google/genai`
- **Social Publishing**: Meta Graph API v23.0 (Facebook Pages + Instagram Business)
- **Cron**: cron-job.org (POST to `/api/jobs/publish-scheduled` every 1 minute with `x-job-key` header)
- **Validation**: Zod v4
- **Date handling**: date-fns v4

---

## Architecture & Flows

### 1. Authentication

- Supabase Auth (email/password) — no OAuth providers for login.
- `middleware.ts` protects `/dashboard/**` routes (redirects to `/login`).
- Logged-in users at `/login` are redirected to `/dashboard/posts`.
- Server components use `@supabase/ssr` via `lib/supabase/server.ts` (cookie-based sessions).
- Client components use `lib/supabase/browser.ts`.
- Admin operations (billing writes, cron job, webhooks) use `lib/supabase/admin.ts` (service_role, bypasses RLS).

### 2. Database Schema

All tables defined in `database.sql` (single migration file).

| Table                   | Purpose                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `profiles`              | User profile linked to `auth.users`. Stores `plan`, `subscription_status`, `monthly_post_limit`, `stripe_customer_id`, `ai_options`.        |
| `social_accounts`       | Meta OAuth connections. `access_token` encrypted with AES-256-GCM. Stores `provider`, `meta_page_id`, `instagram_account_id`, `expires_at`. |
| `posts`                 | Post content (`caption`, `image_url` as JSON array). Status: `draft`, `scheduled`, `published`, `failed`.                                   |
| `scheduled_posts`       | Scheduling metadata. Links to `posts`. Status: `scheduled`, `published`, `failed`. Has `retry_count` (max 3).                               |
| `usage_logs`            | Rate limiting + usage tracking. Auto-cleaned (>90 days) by cron job.                                                                        |
| `stripe_webhook_events` | Idempotency — prevents double-processing webhooks.                                                                                          |

**Security Model:**

- RLS enabled on all tables.
- Column-level REVOKE (deny-by-default UPDATE) on `profiles`, `social_accounts`, `posts`, `scheduled_posts`.
- Only explicitly granted columns are writable by `authenticated` role.
- Billing/status columns only writable by `service_role`.
- DB trigger `enforce_scheduled_post_constraints` validates scheduling rules server-side.

### 3. API Routes

| Route                         | Method       | Auth                              | Purpose                                            |
| ----------------------------- | ------------ | --------------------------------- | -------------------------------------------------- |
| `/api/schedule`               | POST         | User (cookie)                     | Create/edit scheduled posts                        |
| `/api/schedule/[id]`          | DELETE       | User (cookie)                     | Delete a scheduled post                            |
| `/api/uploads`                | POST, DELETE | User (cookie)                     | Upload/delete images to `post-media` bucket        |
| `/api/ai/generate-post`       | POST         | User (cookie, Pro/Elite)          | AI post generation via Gemini                      |
| `/api/meta/connect`           | GET          | User (cookie)                     | Initiate Meta OAuth flow                           |
| `/api/meta/callback`          | GET          | User (cookie)                     | Handle Meta OAuth callback, store encrypted tokens |
| `/api/meta/disconnect`        | POST         | User (cookie)                     | Remove connected social account                    |
| `/api/webhooks/stripe`        | POST         | Stripe signature                  | Process Stripe webhook events                      |
| `/api/jobs/publish-scheduled` | POST         | `x-job-key` header (cron-job.org) | Publish due posts + cleanup old usage_logs         |
| `/auth/callback`              | GET          | Supabase                          | Exchange auth code for session                     |

### 4. Server Actions

| File                    | Actions                                                                                 | Auth          |
| ----------------------- | --------------------------------------------------------------------------------------- | ------------- |
| `app/actions/stripe.ts` | `createStripeCheckoutSession`, `syncStripeCheckoutSession`, `createStripePortalSession` | User (cookie) |

All billing column writes use `createAdminClient()` (service_role) to bypass column-level REVOKE.

### 5. Pages

| Route                        | Type            | Purpose                                                                           |
| ---------------------------- | --------------- | --------------------------------------------------------------------------------- |
| `/`                          | Server          | Landing page (fetches Stripe price for display)                                   |
| `/login`                     | Server + Client | Login / signup form                                                               |
| `/dashboard`                 | Server          | Redirects to `/dashboard/posts`                                                   |
| `/dashboard/posts`           | Server          | Scheduling calendar + token expiry warnings                                       |
| `/dashboard/account-billing` | Server          | Plan info, Stripe management, social account connections with token expiry badges |
| `/dashboard/ai-options`      | Client          | Save AI business context (`ai_options` on profiles)                               |
| `/dashboard/posts/new`       | Server          | Legacy redirect to `/dashboard/posts`                                             |

### 6. Cron Job Behavior (`/api/jobs/publish-scheduled`)

- Runs every 1 minute via cron-job.org (POST with `x-job-key` header).
- Fetches up to 25 due `scheduled` posts.
- For each post: decrypts token → publishes to Meta API → marks `published` → deletes images from storage.
- On failure: increments `retry_count`. After 3 retries: marks `failed`.
- Housekeeping: deletes `usage_logs` older than 90 days each run.

---

## Security Summary

- **RLS** — all tables, deny-by-default column-level REVOKE/GRANT
- **Stripe webhook** — signature validation via `constructEvent`
- **Webhook idempotency** — `stripe_webhook_events` dedup table (unique `event_id`)
- **Meta tokens** — AES-256-GCM encrypted in DB (`lib/crypto.ts`)
- **Cron auth** — `timingSafeEqual` comparison of `x-job-key` header vs `PUBLISH_JOB_SECRET`
- **Billing writes** — only `service_role` client can write `plan`, `subscription_status`, `monthly_post_limit`, `stripe_customer_id`
- **HTTP headers** — CSP, HSTS (production), X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy
- **Rate limiting** — all endpoints use `usage_logs`-based per-user-per-minute limits
- **Input validation** — Zod schemas on all API inputs, max caption lengths, magic-byte file validation
- **File uploads** — MIME allowlist + magic byte validation, 15MB limit, 10 files max, path-scoped to `user.id`
- **DB trigger** — `enforce_scheduled_post_constraints` prevents limit bypass even via direct API calls

## Environment Variables

| Variable                        | Scope  | Description                                           |
| ------------------------------- | ------ | ----------------------------------------------------- |
| `APP_URL`                       | Server | Production domain (e.g., `https://postrocket.app`)    |
| `NEXT_PUBLIC_SUPABASE_URL`      | Public | Supabase project URL                                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon/public key                              |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server | Supabase service role key (bypasses RLS)              |
| `STRIPE_SECRET_KEY`             | Server | Stripe secret key                                     |
| `STRIPE_WEBHOOK_SECRET`         | Server | Stripe webhook signing secret                         |
| `STRIPE_PRO_PRICE_ID`           | Server | Stripe Price ID for Pro plan                          |
| `STRIPE_ELITE_PRICE_ID`         | Server | Stripe Price ID for Elite plan                        |
| `META_APP_ID`                   | Server | Meta/Facebook App ID                                  |
| `META_APP_SECRET`               | Server | Meta/Facebook App Secret                              |
| `META_TOKEN_ENCRYPTION_KEY`     | Server | AES-256 key for encrypting Meta OAuth tokens          |
| `PUBLISH_JOB_SECRET`            | Server | Secret for cron job authentication (x-job-key header) |
| `GEMINI_API_KEY`                | Server | Google Gemini API key for AI generation               |
