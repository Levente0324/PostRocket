# PostRocket — Project Context

## Project Goal

PostRocket is a native Hungarian social media scheduling SaaS for Hungarian small businesses. Users write or AI-generate posts, schedule them to Facebook Pages and Instagram Business accounts in a monthly calendar view, and PostRocket publishes them automatically via a Supabase Edge Function cron. Subscription tiers (Free / Pro / Elite) control active post limits and AI access. Prices: Pro 3 999 Ft/hó, Elite 7 999 Ft/hó.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.9
- **UI**: React 19, Tailwind CSS 4, shadcn/ui, Radix UI, Lucide icons, GSAP animations
- **Database / Auth / Storage**: Supabase (PostgreSQL with full RLS + column-level REVOKE/GRANT, email/password auth via `@supabase/ssr`, `post-media` storage bucket)
- **Payments**: Stripe v20 API `2026-01-28.clover` (Checkout Sessions, Customer Portal, Billing Portal, Webhooks, in-place subscription upgrade)
- **AI**: Google Gemini 2.5 Flash via `@google/genai` (Pro/Elite only; user business context stored in `profiles.ai_options`)
- **Social Publishing**: Meta Graph API v23.0 (Facebook Pages + Instagram Business; images only — video not yet supported)
- **Cron**: cron-job.org → Supabase Edge Function (`supabase/functions/publish-scheduled/index.ts`) every 1 minute
- **Validation**: Zod v4
- **Date handling**: date-fns v4 with Hungarian locale

---

## Architecture & Flows

### 1. Authentication

- Supabase Auth (email/password) — no OAuth providers for app login.
- `middleware.ts` protects `/dashboard/**` routes (redirects to `/login`).
- Logged-in users hitting `/login` are redirected to `/dashboard/posts`.
- Server components use `@supabase/ssr` via `lib/supabase/server.ts` (cookie-based sessions).
- Client components use `lib/supabase/browser.ts`.
- Admin operations (billing writes, cron job, webhooks) use `lib/supabase/admin.ts` (service_role, bypasses RLS).

### 2. Database Schema

All tables defined in `database.sql` (single migration file).

| Table                   | Purpose                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profiles`              | User profile linked to `auth.users`. Stores `plan`, `subscription_status`, `monthly_post_limit`, `stripe_customer_id`, `ai_options` (JSON business context for AI). |
| `social_accounts`       | Meta OAuth connections. `access_token` encrypted with AES-256-GCM. Stores `provider`, `meta_page_id`, `instagram_account_id`, `expires_at`.                         |
| `posts`                 | Post content (`caption`, `image_url` as JSON array of Supabase Storage URLs). Status: `draft`, `scheduled`, `published`, `failed`.                                  |
| `scheduled_posts`       | Scheduling metadata. Links to `posts`. Status: `scheduled`, `published`, `failed`. Has `retry_count` (max 3).                                                       |
| `usage_logs`            | Rate limiting + usage tracking for all endpoints. Auto-cleaned after 90 days by edge function.                                                                      |
| `stripe_webhook_events` | Idempotency table — prevents double-processing of Stripe webhook events (unique `event_id`).                                                                        |

**Security Model:**

- RLS enabled on all tables.
- Column-level REVOKE (deny-by-default UPDATE) on `profiles`, `social_accounts`, `posts`, `scheduled_posts`.
- Only explicitly granted columns are writable by the `authenticated` role.
- Billing/status columns (`plan`, `subscription_status`, `monthly_post_limit`, `stripe_customer_id`) only writable by `service_role`.
- DB trigger `enforce_scheduled_post_constraints` validates scheduling rules server-side (bypass-proof).

### 3. API Routes

| Route                         | Method       | Auth                          | Purpose                                                           |
| ----------------------------- | ------------ | ----------------------------- | ----------------------------------------------------------------- |
| `/api/schedule`               | POST         | User (cookie)                 | Create/edit scheduled posts; validates image URLs to own bucket   |
| `/api/schedule/[id]`          | DELETE       | User (cookie)                 | Delete a scheduled post + associated images from Supabase Storage |
| `/api/uploads`                | POST, DELETE | User (cookie)                 | Upload/delete images (jpeg/png/webp/gif/heic) to `post-media`     |
| `/api/ai/generate-post`       | POST         | User (cookie, Pro/Elite only) | AI post generation via Gemini 2.5 Flash with business context     |
| `/api/meta/connect`           | GET          | User (cookie)                 | Initiate Meta OAuth flow (CSRF state in cookie)                   |
| `/api/meta/callback`          | GET          | User (cookie)                 | Handle Meta OAuth callback, exchange code, store encrypted tokens |
| `/api/meta/disconnect`        | POST         | User (cookie)                 | Remove a connected social account from DB                         |
| `/api/webhooks/stripe`        | POST         | Stripe webhook signature      | Process Stripe events, update profiles via service_role           |
| `/api/jobs/publish-scheduled` | POST         | —                             | **Retired (410 Gone)** — cron now hits the Supabase Edge Function |
| `/auth/callback`              | GET          | Supabase                      | Exchange auth code for session (email confirmation flow)          |

### 4. Server Actions (`app/actions/`)

| File                    | Actions                                                                                                                        | Auth          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| `app/actions/stripe.ts` | `createStripeCheckoutSession` (new sub + in-place Pro→Elite upgrade), `syncStripeCheckoutSession`, `createStripePortalSession` | User (cookie) |

- Pro→Elite upgrade: updates existing subscription in-place via `stripe.subscriptions.update` with `proration_behavior: 'always_invoice'`. No second subscription created.
- All billing column writes use `createAdminClient()` (service_role) to bypass column-level REVOKE.

### 5. Pages

| Route                        | Type            | Purpose                                                                                    |
| ---------------------------- | --------------- | ------------------------------------------------------------------------------------------ |
| `/`                          | Server          | Landing page with pricing, FAQ, features; Hungarian-language                               |
| `/login`                     | Server + Client | Login / signup form; green success banner on registration                                  |
| `/dashboard`                 | Server          | Redirects to `/dashboard/posts`                                                            |
| `/dashboard/posts`           | Server          | Calendar scheduling view + token expiry warnings                                           |
| `/dashboard/account-billing` | Server          | Plan info (with next billing date + amount), Stripe management, social account connections |
| `/dashboard/ai-options`      | Client          | Save AI business context (`ai_options` JSON on profiles) used to personalise AI generation |
| `/dashboard/calendar`        | Server          | (Alias/redirect to posts view)                                                             |
| `/dashboard/insights`        | Server          | Coming soon placeholder                                                                    |
| `/dashboard/posts/new`       | Server          | Legacy redirect → `/dashboard/posts`                                                       |

### 6. Cron / Publishing Flow (`supabase/functions/publish-scheduled/index.ts`)

- Triggered by cron-job.org every 1 minute via POST with `x-job-key` header (timing-safe comparison).
- Fetches up to 25 due `scheduled` posts.
- For each post:
  1. Decrypts Meta access token (AES-256-GCM via Web Crypto API)
  2. Posts images to Meta CDN (via `/{page}/photos` or IG media endpoints)
  3. Publishes to Facebook Page or Instagram Business account
  4. Marks `published` in DB + deletes images from Supabase Storage
- On failure: increments `retry_count`. After 3 retries: marks `failed` + **deletes images** (no orphan files).
- Housekeeping: deletes `usage_logs` older than 90 days on each run.
- Carousel posts: supported for Instagram (multiple images → `CAROUSEL` media type).

### 7. Key Client Components

| Component                                       | Purpose                                                                                  |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `components/dashboard/PostScheduler.tsx`        | Full calendar + post modal (AI panel, IG/FB platform switch with brand colours, + icons) |
| `components/dashboard/SocialConnections.tsx`    | Meta OAuth connect/disconnect UI with token expiry badges and platform explanations      |
| `components/dashboard/UpgradeEliteButton.tsx`   | Premium modal dialog for Pro→Elite upgrade confirmation (backdrop + feature list)        |
| `components/dashboard/PostsDashboardClient.tsx` | Client wrapper for the posts dashboard page                                              |
| `components/landing/LandingExperience.tsx`      | Full landing page (hero, features, pricing, FAQ, animations)                             |
| `components/auth/LoginForm.tsx`                 | Login/register form; green success notification after registration                       |

### 8. File Upload Rules

- **Accepted formats**: jpeg, png, webp, gif, heic/heif (validated by magic bytes, not just MIME type)
- **Max files**: 10 per request
- **Max file size**: 10 MB per file
- **Path scoping**: files stored under `post-media/{user.id}/{uuid}.{ext}` — users can only access their own files
- **Image URL validation**: schedule endpoint verifies URL origin matches the exact Supabase project URL (prevents SSRF)
- **Videos**: not currently supported

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
- **File uploads** — MIME allowlist + magic byte validation, 10 MB limit, 10 files max, path-scoped to `user.id`
- **DB trigger** — `enforce_scheduled_post_constraints` prevents limit bypass even via direct API calls
- **Image URL validation** — schedule endpoint accepts only URLs from the exact configured Supabase project origin
- **Stale Stripe customer handling** — detects deleted/wrong-mode customer IDs, clears and recreates automatically

## Environment Variables

| Variable                        | Scope  | Description                                              |
| ------------------------------- | ------ | -------------------------------------------------------- |
| `APP_URL`                       | Server | Production domain (e.g., `https://postrocket.app`)       |
| `NEXT_PUBLIC_SUPABASE_URL`      | Public | Supabase project URL                                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon/public key                                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server | Supabase service role key (bypasses RLS — server only)   |
| `STRIPE_SECRET_KEY`             | Server | Stripe secret key                                        |
| `STRIPE_WEBHOOK_SECRET`         | Server | Stripe webhook signing secret                            |
| `STRIPE_PRO_PRICE_ID`           | Server | Stripe Price ID for Pro plan (3 999 Ft/hó)               |
| `STRIPE_ELITE_PRICE_ID`         | Server | Stripe Price ID for Elite plan (7 999 Ft/hó)             |
| `META_APP_ID`                   | Server | Meta/Facebook App ID                                     |
| `META_APP_SECRET`               | Server | Meta/Facebook App Secret                                 |
| `META_TOKEN_ENCRYPTION_KEY`     | Server | 32-byte hex AES-256 key for encrypting Meta OAuth tokens |
| `PUBLISH_JOB_SECRET`            | Server | Secret for cron job authentication (`x-job-key` header)  |
| `GEMINI_API_KEY`                | Server | Google Gemini API key for AI post generation             |

