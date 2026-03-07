-- PostRocket Production Schema (Supabase)
-- Calendar-only app — no Meta API, no social_accounts table.
-- Run this in a fresh Supabase project's SQL editor.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Core user profile table
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT NOT NULL DEFAULT 'inactive',
  plan TEXT NOT NULL DEFAULT 'free',
  monthly_post_limit INTEGER NOT NULL DEFAULT 3,
  ai_options TEXT,
  CONSTRAINT profiles_subscription_status_check
    CHECK (subscription_status IN ('inactive','active','trialing','past_due','canceled','unpaid','incomplete','incomplete_expired')),
  CONSTRAINT profiles_plan_check
    CHECK (plan IN ('free','pro','elite')),
  CONSTRAINT profiles_monthly_post_limit_check
    CHECK (monthly_post_limit >= 0)
);

-- ============================================================
-- Post content (caption + optional media references)
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  caption TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT posts_status_check CHECK (status IN ('draft','scheduled','published','failed'))
);

-- ============================================================
-- Scheduling table — links posts to a date/time
-- notified_at: set when the email reminder has been sent (prevents duplicates)
-- ============================================================
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  notified_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'scheduled',
  retry_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT scheduled_posts_status_check CHECK (status IN ('scheduled','published','failed')),
  CONSTRAINT scheduled_posts_retry_count_check CHECK (retry_count >= 0)
);

-- ============================================================
-- Internal audit log for rate-limiting + usage tracking
-- Auto-cleaned after 90 days by edge function
-- ============================================================
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Stripe webhook idempotency + audit
-- ============================================================
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Performance indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_post_id ON scheduled_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status_scheduled_for ON scheduled_posts(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_notified_at ON scheduled_posts(notified_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_action_created ON usage_logs(user_id, action, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id_unique ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_stripe_webhook_event_id_unique ON stripe_webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);

-- ============================================================
-- DB trigger: enforce scheduling constraints
--   - post cannot be in the past
--   - post cannot be beyond +30 days
--   - active scheduled post count cannot exceed plan limit
-- (No more social account check or per-platform uniqueness)
-- ============================================================
CREATE OR REPLACE FUNCTION public.enforce_scheduled_post_constraints()
RETURNS trigger AS $$
DECLARE
  owner_id UUID;
  owner_plan TEXT;
  owner_subscription_status TEXT;
  active_limit INTEGER;
  active_count INTEGER;
BEGIN
  -- Only enforce strict rules when resulting row is 'scheduled'
  IF NEW.status IS DISTINCT FROM 'scheduled' THEN
    RETURN NEW;
  END IF;

  -- Get the owning user
  SELECT user_id INTO owner_id FROM posts WHERE id = NEW.post_id;

  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'Post owner not found for scheduled post.';
  END IF;

  -- Date range guard: cannot be in the past (start of today)
  IF NEW.scheduled_for < date_trunc('day', NOW()) THEN
    RAISE EXCEPTION 'Cannot schedule posts in the past.';
  END IF;

  -- Date range guard: cannot be beyond +30 days
  IF NEW.scheduled_for > (date_trunc('day', NOW()) + interval '31 days' - interval '1 second') THEN
    RAISE EXCEPTION 'Cannot schedule posts beyond 30 days.';
  END IF;

  -- Enforce active scheduled limit by plan
  SELECT plan, subscription_status INTO owner_plan, owner_subscription_status
  FROM profiles
  WHERE id = owner_id;

  IF owner_plan = 'elite' AND owner_subscription_status IN ('active','trialing') THEN
    active_limit := 50;
  ELSIF owner_plan = 'pro' AND owner_subscription_status IN ('active','trialing') THEN
    active_limit := 20;
  ELSE
    active_limit := 3;
  END IF;

  SELECT COUNT(*) INTO active_count
  FROM scheduled_posts sp
  JOIN posts p ON p.id = sp.post_id
  WHERE p.user_id = owner_id
    AND sp.status = 'scheduled'
    AND sp.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  IF active_count + 1 > active_limit THEN
    RAISE EXCEPTION 'Active scheduled post limit reached (%).', active_limit;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS scheduled_posts_require_connected_platform ON scheduled_posts;
DROP TRIGGER IF EXISTS scheduled_posts_constraints ON scheduled_posts;
CREATE TRIGGER scheduled_posts_constraints
  BEFORE INSERT OR UPDATE OF post_id, scheduled_for, status
  ON scheduled_posts
  FOR EACH ROW
  EXECUTE PROCEDURE public.enforce_scheduled_post_constraints();

-- ============================================================
-- Row-level security (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- ---- profiles -----------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
-- WITH CHECK prevents privilege escalation even when USING passes.
-- Column-level REVOKE below further blocks writes to billing columns.
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Deny-by-default: revoke ALL update access, allow only safe columns.
-- Billing/plan columns must only be mutated by the service_role (Stripe webhooks, admin).
REVOKE UPDATE ON profiles FROM authenticated;
GRANT UPDATE (full_name, ai_options) ON profiles TO authenticated;

-- ---- posts --------------------------------------------------
DROP POLICY IF EXISTS "Users can view own posts" ON posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- Only caption and image_url are editable by the client (schedule edit path).
-- status must only be mutated by the service_role (notify cron).
REVOKE UPDATE ON posts FROM authenticated;
GRANT UPDATE (caption, image_url) ON posts TO authenticated;

-- ---- scheduled_posts (via parent posts ownership) -----------
DROP POLICY IF EXISTS "Users can view own scheduled posts" ON scheduled_posts;
DROP POLICY IF EXISTS "Users can insert own scheduled posts" ON scheduled_posts;
DROP POLICY IF EXISTS "Users can update own scheduled posts" ON scheduled_posts;
DROP POLICY IF EXISTS "Users can delete own scheduled posts" ON scheduled_posts;
CREATE POLICY "Users can view own scheduled posts" ON scheduled_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts WHERE posts.id = scheduled_posts.post_id AND posts.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert own scheduled posts" ON scheduled_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts WHERE posts.id = scheduled_posts.post_id AND posts.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own scheduled posts" ON scheduled_posts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM posts WHERE posts.id = scheduled_posts.post_id AND posts.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete own scheduled posts" ON scheduled_posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM posts WHERE posts.id = scheduled_posts.post_id AND posts.user_id = auth.uid()
    )
  );

-- Only scheduled_for is editable by the client (schedule edit path).
-- status, retry_count, error_message, published_at, notified_at must only be
-- mutated by the service_role (notify cron).
REVOKE UPDATE ON scheduled_posts FROM authenticated;
GRANT UPDATE (scheduled_for) ON scheduled_posts TO authenticated;

-- ---- usage_logs --------------------------------------------
DROP POLICY IF EXISTS "Users can view own usage logs" ON usage_logs;
DROP POLICY IF EXISTS "Users can insert own usage logs" ON usage_logs;
CREATE POLICY "Users can view own usage logs" ON usage_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage logs" ON usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ---- stripe_webhook_events (service_role only) -------------
DROP POLICY IF EXISTS "No direct access to stripe_webhook_events" ON stripe_webhook_events;
CREATE POLICY "No direct access to stripe_webhook_events" ON stripe_webhook_events
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- Trigger: auto-create profile row on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- Storage: post-media bucket
-- Users can upload/delete/select only inside post-media/<auth.uid()>/...
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'post-media' );

DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
CREATE POLICY "Authenticated users can upload media"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'post-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Authenticated users can view media" ON storage.objects;
CREATE POLICY "Authenticated users can view media"
ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'post-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;
CREATE POLICY "Users can delete their own media"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'post-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
