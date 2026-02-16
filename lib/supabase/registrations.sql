-- ============================================
-- Event Registrations Table
-- ============================================

CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Users can view their own registrations
CREATE POLICY "Users can view own registrations"
    ON event_registrations FOR SELECT
    USING (auth.uid() = user_id);

-- Users can register themselves
CREATE POLICY "Users can register themselves"
    ON event_registrations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can cancel their own registration
CREATE POLICY "Users can delete own registrations"
    ON event_registrations FOR DELETE
    USING (auth.uid() = user_id);

-- Admins can view all registrations (assuming admin role or bypassing RLS in admin dashboard)
-- For now, we'll keep it simple. If you have an 'admin' role in public.users or similar, add that check.
-- Or just rely on the service role key for admin operations.
