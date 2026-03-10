-- Enable UPDATE on user_passes so upsert works for retries
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_passes' AND cmd = 'UPDATE'
    ) THEN
        CREATE POLICY "Users can update their own passes" ON public.user_passes
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;
