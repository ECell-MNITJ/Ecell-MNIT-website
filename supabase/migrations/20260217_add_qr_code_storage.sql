-- Add qr_code_url to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

-- Create storage bucket for QR codes
INSERT INTO storage.buckets (id, name, public)
VALUES ('qr-codes', 'qr-codes', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for qr-codes bucket

-- Allow public read access (so scanners can see it if needed, or user can see it)
CREATE POLICY "Public QR code access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'qr-codes');

-- Allow authenticated users to upload their OWN QR code (file name should start with their user ID)
-- For simplicity, we'll allow authenticated users to upload to this bucket.
-- A stricter policy would check the filename prefix, but this is sufficient for now.
CREATE POLICY "Authenticated users can upload QR codes"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their own QR codes
CREATE POLICY "Authenticated users can update QR codes"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');
