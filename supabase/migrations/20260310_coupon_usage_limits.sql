-- Add usage_limit column
ALTER TABLE public.campus_ambassadors
ADD COLUMN IF NOT EXISTS usage_limit INTEGER DEFAULT NULL;

-- Trigger function to check and auto-disable coupons
CREATE OR REPLACE FUNCTION check_coupon_usage_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_ca_id UUID;
    v_referral_code TEXT;
    v_usage_limit INTEGER;
    v_current_usage INTEGER;
BEGIN
    -- Only proceed if the payment_status is updated to 'success' or inserted as 'success'
    IF (TG_OP = 'INSERT' AND NEW.payment_status = 'success') OR
       (TG_OP = 'UPDATE' AND NEW.payment_status = 'success' AND OLD.payment_status != 'success') THEN
        
        -- Get the referral code used
        v_referral_code := NEW.applied_referral_code;

        IF v_referral_code IS NOT NULL THEN
            -- Find the corresponding CA / Coupon
            SELECT id, usage_limit INTO v_ca_id, v_usage_limit
            FROM public.campus_ambassadors
            WHERE referral_code = v_referral_code AND is_active = true;

            -- If found and it has a limit
            IF FOUND AND v_usage_limit IS NOT NULL THEN
                -- Count how many successful passes have used this code
                SELECT COUNT(*) INTO v_current_usage
                FROM public.user_passes
                WHERE applied_referral_code = v_referral_code AND payment_status = 'success';

                -- Compare usage
                IF v_current_usage >= v_usage_limit THEN
                    -- Disable the coupon
                    UPDATE public.campus_ambassadors
                    SET is_active = false
                    WHERE id = v_ca_id;
                END IF;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid errors on re-run
DROP TRIGGER IF EXISTS trigger_auto_disable_coupon ON public.user_passes;

-- Create the trigger
CREATE TRIGGER trigger_auto_disable_coupon
AFTER INSERT OR UPDATE ON public.user_passes
FOR EACH ROW
EXECUTE FUNCTION check_coupon_usage_limit();
