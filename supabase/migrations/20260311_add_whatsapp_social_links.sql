-- Add whatsapp_url to site_settings
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS whatsapp_url TEXT;

-- Add whatsapp_url and potential missing social columns to esummit_settings
ALTER TABLE esummit_settings 
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_url TEXT;
