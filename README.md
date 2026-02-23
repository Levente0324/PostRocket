# PostPilot - AI Social Media Automation

Your AI social media manager. Connect, generate, and schedule posts with ease.

## Tech Stack

- **Frontend**: Next.js 14 App Router, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Next.js Server Actions, Supabase (Auth + DB)
- **Payments**: Stripe Subscriptions
- **AI**: Google Gemini API

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Go to the SQL Editor and run the contents of `database.sql` to create the schema and RLS policies.
3. Go to Project Settings -> API and copy the `Project URL` and `anon public` key.
4. Go to Project Settings -> API and copy the `service_role` secret key.
5. Add these to your environment variables in AI Studio:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 2. Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com).
2. Go to Developers -> API Keys and copy the `Secret key`.
3. Create a Product and Price for the "Business" plan. Copy the Price ID.
4. Go to Developers -> Webhooks and add an endpoint pointing to `https://your-app-url.run.app/api/webhooks/stripe`.
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
   - Copy the Webhook Signing Secret.
5. Add these to your environment variables in AI Studio:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_BUSINESS_PRICE_ID`

### 3. Social OAuth (Meta)

1. Go to [developers.facebook.com](https://developers.facebook.com) and create an app.
2. Add Instagram Graph API and Facebook Login products.
3. Configure the OAuth redirect URIs to point to your app's callback URL.
4. (Implementation for Meta OAuth requires further setup of Facebook SDK or manual OAuth flow which is stubbed in the UI).

## Deployment

This app is ready to be deployed on Vercel or any Next.js compatible hosting provider. Ensure all environment variables are set in the production environment.
