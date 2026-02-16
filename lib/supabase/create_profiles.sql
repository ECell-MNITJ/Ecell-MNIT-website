-- Create a table for public profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  phone TEXT,
  
  CONSTRAINT username_length CHECK (char_length(full_name) >= 3)
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create a trigger to auto-create profile on signup
-- This ensures every new user has a profile row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies for avatars to avoid conflicts
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their avatars." ON storage.objects;

-- Create policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars."
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their avatars."
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
