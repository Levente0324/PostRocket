# PostRocket

AI-alapú közösségi média ütemező SaaS — Facebook és Instagram csatornákhoz, magyar vállalkozásoknak.

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript 5.9** + **React 19**
- **Tailwind CSS 4** + shadcn/ui components
- **Supabase** — Auth (email/password), PostgreSQL (full RLS), Storage (`post-media` bucket)
- **Stripe v20** — Checkout Sessions, Customer Portal, Webhooks
- **Google Gemini 2.5 Flash** — AI poszt generálás (Pro/Elite)
- **Meta Graph API v23.0** — Facebook Pages + Instagram Business publishing
- **cron-job.org** — külső cron worker (POST, percenként)

## Előfizetési szintek

| Csomag | Aktív posztok | AI szövegírás | Ár          |
| ------ | ------------- | ------------- | ----------- |
| Free   | 3             | ✗             | 0 Ft        |
| Pro    | 20            | ✓             | 3 990 Ft/hó |
| Elite  | 50            | ✓             | 7 990 Ft/hó |

## Környezeti változók

Használd az `.env.example` fájlt mintának. **Minden kulcs kötelező production-ben.**

## Telepítési checklist

### 1. Adatbázis

Futtasd a `database.sql` fájlt a Supabase SQL Editorban. Ez létrehozza:

- Táblákat (profiles, social_accounts, posts, scheduled_posts, usage_logs, stripe_webhook_events)
- RLS policy-kat minden táblához
- Column-level REVOKE/GRANT-ot (deny-by-default minden UPDATE-ra)
- DB trigger-t (`enforce_scheduled_post_constraints`) ütemezési szabályokhoz
- Storage bucket-et és policy-kat (`post-media`)

### 2. Stripe webhook

- Endpoint: `https://<domain>/api/webhooks/stripe`
- Események: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`

### 3. Meta OAuth

- Redirect URI: `https://<domain>/api/meta/callback`
- Szükséges jogosultságok: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `instagram_basic`, `instagram_content_publish`, `business_management`

### 4. Cron job (cron-job.org)

- Method: `POST`
- URL: `https://<domain>/api/jobs/publish-scheduled`
- Header: `x-job-key: <PUBLISH_JOB_SECRET>`
- Gyakoriság: percenként

### 5. Vercel deploy

- Állítsd be az összes env var-t a Vercel Project Settings-ben
- `APP_URL` = a production domain (pl. `https://postrocket.app`)

## Biztonsági összefoglaló

- **RLS** — minden tábla, deny-by-default column-level REVOKE
- **Stripe webhook** — szignatúra validáció (`constructEvent`)
- **Webhook idempotencia** — `stripe_webhook_events` dedup tábla
- **Meta tokenek** — AES-256-GCM titkosítás (`META_TOKEN_ENCRYPTION_KEY`)
- **Cron auth** — `timingSafeEqual` a `x-job-key` fejlécen
- **Billing writes** — kizárólag `service_role` (admin client) írhatja
- **CSP, HSTS, X-Frame-Options, Referrer-Policy** — konfigurálva
- **Rate limiting** — minden endpoint-on `usage_logs` alapú
- **DB trigger** — ütemezési korlátok server-szintű kikényszerítése
- **Token expiry warnings** — dashboard figyelmeztetés lejáró Meta tokenekre

## Fejlesztés

```bash
npm install
npm run dev
```

## Scripts

| Parancs         | Leírás               |
| --------------- | -------------------- |
| `npm run dev`   | Fejlesztői szerver   |
| `npm run build` | Production build     |
| `npm run start` | Production szerver   |
| `npm run lint`  | ESLint futtatás      |
| `npm run clean` | Next.js cache törlés |
