-- Migration: Add image_urls array to esummit_merchandise
-- Created: 2026-03-18

-- 1. Add the image_urls column
ALTER TABLE public.esummit_merchandise 
ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';

-- 2. Migrate existing data
UPDATE public.esummit_merchandise
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL 
  AND (image_urls IS NULL OR cardinality(image_urls) = 0);

-- 3. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
