-- Supabase Database Schema for PostPilot

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  plan TEXT DEFAULT 'free',
  monthly_post_limit INTEGER DEFAULT 0
);

-- Social Accounts Table
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'instagram' or 'facebook'
  access_token TEXT NOT NULL, -- Should be encrypted in a real app
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  account_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts Table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  caption TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'published'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled Posts Table
CREATE TABLE scheduled_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  platform TEXT NOT NULL, -- 'instagram', 'facebook', 'both'
  published_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'scheduled' -- 'scheduled', 'published', 'failed'
);

-- Usage Logs Table
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Social Accounts Policies
CREATE POLICY "Users can view own social accounts" ON social_accounts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own social accounts" ON social_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own social accounts" ON social_accounts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own social accounts" ON social_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Posts Policies
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- Scheduled Posts Policies (Through Posts)
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

-- Usage Logs Policies
CREATE POLICY "Users can view own usage logs" ON usage_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage logs" ON usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
