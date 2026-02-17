-- Add scanner_password to esummit_settings if it doesn't exist
ALTER TABLE esummit_settings
ADD COLUMN IF NOT EXISTS scanner_password text DEFAULT 'scan123';

-- Create a secure function to verify the scanner password
CREATE OR REPLACE FUNCTION verify_scanner_password(input_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (postgres/admin), allowing access to the table even if user doesn't have it
AS $$
DECLARE
    stored_password text;
BEGIN
    SELECT scanner_password INTO stored_password FROM esummit_settings LIMIT 1;
    
    -- If no settings row exists, return false (or true if you want default access, but false is safer)
    IF stored_password IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN stored_password = input_password;
END;
$$;
