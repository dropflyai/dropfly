-- SoulSync Database Schema
-- Run this in the Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  birthdate DATE,
  age INTEGER GENERATED ALWAYS AS (
    EXTRACT(YEAR FROM age(CURRENT_DATE, birthdate))
  ) STORED,
  gender TEXT CHECK (gender IN ('male', 'female', 'non-binary')),
  location TEXT,
  relationship_goal TEXT CHECK (relationship_goal IN (
    'long-term', 'short-term', 'casual', 'friendship', 'not-sure'
  )),
  core_values TEXT[] DEFAULT '{}',
  attachment_style TEXT CHECK (attachment_style IN (
    'secure', 'anxious', 'avoidant', 'fearful-avoidant'
  )),
  love_languages TEXT[] DEFAULT '{}',
  voice_intro_url TEXT,
  voice_intro_transcript TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  bio TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONNECTION REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS connection_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  voice_note_url TEXT NOT NULL,
  voice_note_transcript TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(from_user_id, to_user_id)
);

CREATE TRIGGER update_connection_requests_updated_at
  BEFORE UPDATE ON connection_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MATCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Woman (approver)
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Man (requester)
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'pending_approval', 'active', 'completed', 'revealed', 'expired', 'exited'
  )),
  compatibility_score NUMERIC,
  current_round INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user1_id, user2_id)
);

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PROMPTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_type TEXT NOT NULL CHECK (round_type IN ('voice', 'video')),
  prompt_text TEXT NOT NULL,
  category TEXT CHECK (category IN ('icebreaker', 'deep', 'fun', 'values', 'future')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed prompts
INSERT INTO prompts (round_type, prompt_text, category) VALUES
  ('voice', 'What''s something that always makes you smile, no matter what?', 'icebreaker'),
  ('voice', 'Describe your perfect lazy Sunday morning.', 'icebreaker'),
  ('voice', 'What''s a hobby or interest you''d love to share with a partner?', 'icebreaker'),
  ('voice', 'What''s a small thing that makes your day better?', 'icebreaker'),
  ('voice', 'If you could master any skill overnight, what would it be?', 'fun'),
  ('voice', 'What''s the most memorable trip you''ve ever taken?', 'fun'),
  ('voice', 'What''s your go-to comfort food and why?', 'fun'),
  ('voice', 'What''s a value you won''t compromise on in a relationship?', 'values'),
  ('voice', 'How do you typically handle disagreements with someone you care about?', 'values'),
  ('voice', 'What role does family play in your life?', 'values'),
  ('voice', 'What does your ideal future look like in 5 years?', 'future'),
  ('voice', 'How do you like to spend quality time with a partner?', 'deep'),
  ('voice', 'What''s something you''re working on improving about yourself?', 'deep'),
  ('voice', 'What makes you feel most loved and appreciated?', 'deep'),
  ('voice', 'What''s a dream you''ve never told anyone about?', 'deep'),
  ('video', 'Show us your favorite spot in your home and tell us why you love it.', 'icebreaker'),
  ('video', 'What''s something you''re proud of? Show and tell!', 'deep'),
  ('video', 'Give us a tour of something you''re passionate about.', 'fun'),
  ('video', 'Share a talent or something unique about you.', 'fun'),
  ('video', 'What would our first date look like? Describe it!', 'future');

-- ============================================
-- CONNECTIVITY ROUNDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS connectivity_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  round_type TEXT NOT NULL CHECK (round_type IN ('voice', 'video')),
  prompt_id UUID REFERENCES prompts(id),
  prompt_text TEXT NOT NULL,
  user1_response_url TEXT,
  user1_responded_at TIMESTAMP WITH TIME ZONE,
  user2_response_url TEXT,
  user2_responded_at TIMESTAMP WITH TIME ZONE,
  user1_lifelines_used INTEGER DEFAULT 0,
  user2_lifelines_used INTEGER DEFAULT 0,
  deadline_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'user1_responded', 'user2_responded', 'completed', 'expired'
  )),
  ai_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(match_id, round_number)
);

-- ============================================
-- REVEALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reveals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE UNIQUE,
  user1_approved BOOLEAN DEFAULT FALSE,
  user2_approved BOOLEAN DEFAULT FALSE,
  revealed_at TIMESTAMP WITH TIME ZONE,
  user1_continue BOOLEAN,
  user2_continue BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MESSAGES TABLE (for Real Life Ready)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE connectivity_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE reveals ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read profiles (for discovery), but only update their own
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (onboarding_completed = TRUE OR id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Connection requests: Users can see requests they sent or received
CREATE POLICY "Users can view their connection requests"
  ON connection_requests FOR SELECT
  TO authenticated
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can create connection requests"
  ON connection_requests FOR INSERT
  TO authenticated
  WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "Users can update requests sent to them"
  ON connection_requests FOR UPDATE
  TO authenticated
  USING (to_user_id = auth.uid());

-- Matches: Users can see matches they're part of
CREATE POLICY "Users can view their matches"
  ON matches FOR SELECT
  TO authenticated
  USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users can create matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users can update their matches"
  ON matches FOR UPDATE
  TO authenticated
  USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- Connectivity rounds: Users can see rounds for their matches
CREATE POLICY "Users can view rounds for their matches"
  ON connectivity_rounds FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = connectivity_rounds.match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can create rounds for their matches"
  ON connectivity_rounds FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update rounds for their matches"
  ON connectivity_rounds FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = connectivity_rounds.match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

-- Reveals: Users can see reveals for their matches
CREATE POLICY "Users can view reveals for their matches"
  ON reveals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = reveals.match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can create/update reveals for their matches"
  ON reveals FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = reveals.match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

-- Messages: Users can see messages for their matches
CREATE POLICY "Users can view messages for their matches"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their matches"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

-- Prompts: Everyone can read prompts
CREATE POLICY "Prompts are viewable by everyone"
  ON prompts FOR SELECT
  TO authenticated
  USING (active = TRUE);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Run these in the Supabase Dashboard -> Storage or via SQL below

-- Create buckets (run once):
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-notes', 'voice-notes', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE RLS POLICIES
-- ============================================

-- Voice notes: Users can only upload to their own folder
CREATE POLICY "Users can upload voice notes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'voice-notes' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Voice notes: Anyone can read (needed for playback)
CREATE POLICY "Voice notes are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'voice-notes');

-- Voice notes: Users can delete their own
CREATE POLICY "Users can delete own voice notes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'voice-notes' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Photos: Users can only upload to their own folder
CREATE POLICY "Users can upload their photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Photos: Anyone can read (needed for reveals)
CREATE POLICY "Photos are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'photos');

-- Photos: Users can delete their own
CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Videos: Users can only upload to their own folder
CREATE POLICY "Users can upload videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Videos: Anyone can read (needed for connectivity rounds)
CREATE POLICY "Videos are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'videos');

-- Videos: Users can delete their own
CREATE POLICY "Users can delete own videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- PUSH TOKENS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  token TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_push_tokens_updated_at
  BEFORE UPDATE ON push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their push tokens"
  ON push_tokens FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- USER PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  min_age INTEGER DEFAULT 18,
  max_age INTEGER DEFAULT 100,
  show_me TEXT CHECK (show_me IN ('men', 'women', 'everyone')),
  relationship_goals TEXT[] DEFAULT '{}',
  max_distance INTEGER DEFAULT 50, -- in miles
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_connection_requests_to_user ON connection_requests(to_user_id, status);
CREATE INDEX IF NOT EXISTS idx_connection_requests_from_user ON connection_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id, status);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id, status);
CREATE INDEX IF NOT EXISTS idx_connectivity_rounds_match ON connectivity_rounds(match_id, round_number);
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id, created_at);

-- ============================================
-- BLOCKED USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their blocks"
  ON blocked_users FOR SELECT
  TO authenticated
  USING (blocker_id = auth.uid());

CREATE POLICY "Users can create blocks"
  ON blocked_users FOR INSERT
  TO authenticated
  WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users can delete their blocks"
  ON blocked_users FOR DELETE
  TO authenticated
  USING (blocker_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_id);

-- ============================================
-- USER REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN (
    'inappropriate_content', 'harassment', 'fake_profile',
    'spam', 'underage', 'other'
  )),
  description TEXT,
  evidence_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_user_reports_updated_at
  BEFORE UPDATE ON user_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports"
  ON user_reports FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

CREATE POLICY "Users can create reports"
  ON user_reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported ON user_reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
