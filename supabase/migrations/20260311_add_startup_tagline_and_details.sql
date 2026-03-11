-- Migration to add tagline and detailed description to startups
ALTER TABLE startups 
ADD COLUMN tagline TEXT,
ADD COLUMN detailed_description TEXT;
