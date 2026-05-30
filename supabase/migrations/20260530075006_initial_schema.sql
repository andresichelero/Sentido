-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4.2 Tabela: profiles
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  notification_time_morning TIME,
  notification_time_evening TIME,
  preferred_entry_mode TEXT DEFAULT 'wheel',
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger for profiles
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING (auth.uid() = id);

-- Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql security definer;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4.3 Tabela: checkins
CREATE TABLE checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  checked_at TIMESTAMPTZ,
  emotions JSONB,
  context TEXT,
  note TEXT,
  entry_mode TEXT,
  valence_score SMALLINT,
  arousal_score SMALLINT,
  body_regions JSONB,
  reflection JSONB,
  is_synced BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger for checkins
CREATE TRIGGER checkins_updated_at
  BEFORE UPDATE ON checkins
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Indexes for checkins
CREATE INDEX checkins_user_id_checked_at_idx ON checkins (user_id, checked_at DESC);
CREATE INDEX checkins_user_id_checked_at_date_idx ON checkins (user_id, (CAST(checked_at AT TIME ZONE 'UTC' AS DATE)));
CREATE INDEX checkins_emotions_gin_idx ON checkins USING GIN (emotions);

-- RLS for checkins
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own checkins" ON checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checkins" ON checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checkins" ON checkins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checkins" ON checkins FOR DELETE USING (auth.uid() = user_id);

-- 4.4 Tabela: user_insights
CREATE TABLE user_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT,
  data JSONB,
  seen BOOLEAN DEFAULT false,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger for user_insights
CREATE TRIGGER user_insights_updated_at
  BEFORE UPDATE ON user_insights
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- RLS for user_insights
ALTER TABLE user_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own insights" ON user_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON user_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON user_insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own insights" ON user_insights FOR DELETE USING (auth.uid() = user_id);
