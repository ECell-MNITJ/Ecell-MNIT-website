-- 1. Add email column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Update the handle_new_user trigger function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (
      new.id, 
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'avatar_url', 
      new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Backfill existing profiles with emails from auth.users
-- This query joins with the auth.users table to populate the email column
UPDATE public.profiles
SET email = auth.users.email
FROM auth.users
WHERE public.profiles.id = auth.users.id;
