# PostRocket

Natív magyar közösségi média ütemező SaaS — Facebook oldalakhoz és Instagram Business fiókokhoz, magyar vállalkozásoknak. Írj vagy AI-jal generálj posztokat, ütemezd őket a naptárban, és a PostRocket automatikusan közzéteszi őket.

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript 5.9** + **React 19**
- **Tailwind CSS 4** + shadcn/ui components
- **Supabase** — Auth (email/jelszó), PostgreSQL (teljes RLS + oszlopszintű REVOKE/GRANT), Storage (`post-media` bucket)
- **Stripe v20** — Checkout Sessions, Customer Portal, Webhooks, Billing Portal
- **Google Gemini 2.5 Flash** — AI poszt generálás (Pro/Elite)
- **Meta Graph API v23.0** — Facebook Pages + Instagram Business közzététel
- **cron-job.org** — külső cron worker (POST minden percben a Supabase Edge Functionre)
- **Supabase Edge Functions** (Deno) — `publish-scheduled`: token visszafejtés, Meta API hívások, hibakezelés

## Előfizetési szintek

| Csomag | Aktív posztok | AI szövegírás | Ár          |
| ------ | ------------- | ------------- | ----------- |
| Free   | 3             | ✗             | 0 Ft        |
| Pro    | 20            | ✓             | 3 999 Ft/hó |
| Elite  | 50            | ✓             | 7 999 Ft/hó |

Elite extra: KORLÁTLAN AI szövegírás, AI képgenerálás (hamarosan), elsőbbségi támogatás.

## Fő funkciók

- **Naptár nézet** — havi nézet, naponként max. 1 IG + 1 FB poszt ütemezhető
- **AI szövegírás** — Gemini 2.5 Flash, platform + hangnem alapján, felhasználói üzleti kontextussal
- **Kép feltöltés** — max. 10 kép, max. 10 MB per fájl, magic-byte validáció (jpeg, png, webp, gif, heic/heif)
- **Meta OAuth** — Facebook oldal + Instagram Business csatlakoztatása, AES-256-GCM titkosított tokenek
- **Token lejárat figyelmeztetés** — dashboard badge, ha a Meta token lejár / hamarosan lejár
- **Pro→Elite upgrade** — helyszíni előfizetés módosítás dialog megerősítéssel, arányos számlázással
- **Következő számlázási dátum** — megjelenik a fiók oldalon az összeg és dátum feltüntetésével

## Architektúra áttekintés

```
browser → Next.js (App Router)
               ├─ /api/schedule          # post létrehozás/szerkesztés
               ├─ /api/schedule/[id]     # post törlés
               ├─ /api/uploads          # Supabase Storage feltöltés
               ├─ /api/ai/generate-post # Gemini AI generálás
               ├─ /api/meta/*           # OAuth connect/callback/disconnect
               ├─ /api/webhooks/stripe  # Stripe webhook
               └─ /api/jobs/publish-scheduled  # cron endpoint (visszavonva 410)

cron-job.org → Supabase Edge Function (publish-scheduled)
                   ├─ token visszafejtés (AES-256-GCM)
                   ├─ Meta Graph API (kép + Facebook + Instagram)
                   ├─ retry logika (max 3 próbálkozás)
                   └─ kép törlés sikeres/véglegesen sikertelen poszt után
```

## Telepítési checklist

### 1. Adatbázis

Futtasd a `database.sql` fájlt a Supabase SQL Editorban. Ez létrehozza:

- Táblákat: `profiles`, `social_accounts`, `posts`, `scheduled_posts`, `usage_logs`, `stripe_webhook_events`
- RLS policy-kat minden táblához
- Column-level REVOKE/GRANT (deny-by-default minden UPDATE-ra, csak engedélyezett oszlopok írhatók)
- DB trigger: `enforce_scheduled_post_constraints` — ütemezési korlátok server-szintű kikényszerítése
- Storage bucket + policy-k: `post-media`

### 2. Supabase Edge Function

```bash
supabase functions deploy publish-scheduled
```

Környezeti változók (Supabase Dashboard → Edge Functions → Secrets):

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `META_TOKEN_ENCRYPTION_KEY`
- `PUBLISH_JOB_SECRET`

### 3. Stripe webhook

- Endpoint: `https://<domain>/api/webhooks/stripe`
- Események: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`

### 4. Meta OAuth

- Redirect URI: `https://<domain>/api/meta/callback`
- Szükséges jogosultságok: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `instagram_basic`, `instagram_content_publish`, `business_management`

### 5. Cron job (cron-job.org)

- Method: `POST`
- URL: `https://<project>.supabase.co/functions/v1/publish-scheduled`
- Header: `Authorization: Bearer <SUPABASE_ANON_KEY>` + `x-job-key: <PUBLISH_JOB_SECRET>`
- Gyakoriság: percenként

### 6. Vercel deploy

- Állítsd be az összes env var-t a Vercel Project Settings-ben
- `APP_URL` = a production domain (pl. `https://postrocket.app`)

## Biztonsági összefoglaló

- **RLS** — minden tábla, deny-by-default column-level REVOKE/GRANT
- **Stripe webhook** — szignatúra validáció (`constructEvent`)
- **Webhook idempotencia** — `stripe_webhook_events` dedup tábla (unique `event_id`)
- **Meta tokenek** — AES-256-GCM titkosítás a DB-ben (`META_TOKEN_ENCRYPTION_KEY`)
- **Cron auth** — `timingSafeEqual` az `x-job-key` fejlécen
- **Billing writes** — kizárólag `service_role` admin client írhatja (column-level REVOKE)
- **HTTP fejlécek** — CSP, HSTS (production), X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Rate limiting** — minden endpoint-on `usage_logs` alapú (per-user/per-minute)
- **Fájl validáció** — MIME allowlist + magic-byte ellenőrzés, path scope user ID-ra
- **DB trigger** — ütemezési korlátok server-szintű kikényszerítése (bypass-proof)
- **Image URL validáció** — csak a saját Supabase project origin fogadható el

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
