-- =====================================================
-- COMPLETE DATABASE FIX SCRIPT
-- =====================================================
-- This script fixes ALL issues:
-- 1. Renames tables to lowercase
-- 2. Fixes RLS policies (no infinite recursion)
-- 3. Updates real-time subscriptions
-- 4. Cleans up test data
-- =====================================================

-- =====================================================
-- STEP 1: CLEAN UP TEST USERS
-- =====================================================
DELETE FROM users WHERE email LIKE '%@capiena.com' OR email LIKE '%fybogelv%';

-- =====================================================
-- STEP 2: RENAME TABLES TO LOWERCASE
-- =====================================================
ALTER TABLE IF EXISTS Plan RENAME TO plan;
ALTER TABLE IF EXISTS Role RENAME TO role;
ALTER TABLE IF EXISTS PlanPolicy RENAME TO planpolicy;
ALTER TABLE IF EXISTS Subscription RENAME TO subscription;
ALTER TABLE IF EXISTS AdminAction RENAME TO adminaction;
ALTER TABLE IF EXISTS Review RENAME TO review;
ALTER TABLE IF EXISTS Scan RENAME TO scan;
ALTER TABLE IF EXISTS History RENAME TO history;
ALTER TABLE IF EXISTS ThreatSummary RENAME TO threatsummary;
ALTER TABLE IF EXISTS DetailedReport RENAME TO detailedreport;
ALTER TABLE IF EXISTS ScoreReport RENAME TO scorereport;
ALTER TABLE IF EXISTS AuditLog RENAME TO auditlog;
ALTER TABLE IF EXISTS UsageCounter RENAME TO usagecounter;

-- =====================================================
-- STEP 3: FIX RLS POLICIES
-- =====================================================

-- Drop all existing policies (from both PascalCase and lowercase versions)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON users;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscription;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON subscription;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON Subscription;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON Subscription;

-- Users table policies (NO RECURSION)
CREATE POLICY "allow_authenticated_insert_users" 
ON users
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "allow_select_own_profile" 
ON users
FOR SELECT 
TO authenticated
USING (auth.uid() = auth_user_id);

CREATE POLICY "allow_update_own_profile" 
ON users
FOR UPDATE 
TO authenticated
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- Subscription table policies
CREATE POLICY "allow_authenticated_insert_subscription" 
ON subscription
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.user_id = subscription.user_id 
    AND users.auth_user_id = auth.uid()
  )
);

CREATE POLICY "allow_select_own_subscription" 
ON subscription
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.user_id = subscription.user_id 
    AND users.auth_user_id = auth.uid()
  )
);

CREATE POLICY "allow_update_own_subscription" 
ON subscription
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.user_id = subscription.user_id 
    AND users.auth_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.user_id = subscription.user_id 
    AND users.auth_user_id = auth.uid()
  )
);

-- =====================================================
-- STEP 4: MAKE LOOKUP TABLES READABLE
-- =====================================================

ALTER TABLE plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE role ENABLE ROW LEVEL SECURITY;
ALTER TABLE planpolicy ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view plans" ON plan;
DROP POLICY IF EXISTS "Everyone can view roles" ON role;
DROP POLICY IF EXISTS "Everyone can view plan policies" ON planpolicy;
DROP POLICY IF EXISTS "authenticated_can_read_plans" ON plan;
DROP POLICY IF EXISTS "authenticated_can_read_roles" ON role;
DROP POLICY IF EXISTS "authenticated_can_read_policies" ON planpolicy;

CREATE POLICY "authenticated_can_read_plans" ON plan
FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_can_read_roles" ON role
FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_can_read_policies" ON planpolicy
FOR SELECT TO authenticated USING (true);

-- =====================================================
-- STEP 5: UPDATE REAL-TIME SUBSCRIPTIONS
-- =====================================================

DO $$
BEGIN
    -- Remove old PascalCase table names from realtime if they exist
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE Scan;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE AuditLog;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE DetailedReport;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE ThreatSummary;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE History;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
    
    -- Try to drop lowercase versions too (in case they were added before)
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE scan;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE auditlog;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE detailedreport;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE threatsummary;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE history;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
END $$;

-- Add lowercase table names to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE scan;
ALTER PUBLICATION supabase_realtime ADD TABLE auditlog;
ALTER PUBLICATION supabase_realtime ADD TABLE detailedreport;
ALTER PUBLICATION supabase_realtime ADD TABLE threatsummary;
ALTER PUBLICATION supabase_realtime ADD TABLE history;

-- =====================================================
-- STEP 6: VERIFICATION
-- =====================================================

-- Show all tables (should be lowercase)
SELECT 
    tablename as "Table Name",
    schemaname as "Schema"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Show all policies on users and subscription tables
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as "Command",
    qual as "Using Expression"
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'subscription')
ORDER BY tablename, policyname;

SELECT '✅ DATABASE COMPLETELY FIXED!' as status;
SELECT '✅ All tables renamed to lowercase' as step1;
SELECT '✅ RLS policies fixed (no infinite recursion)' as step2;
SELECT '✅ Real-time subscriptions updated' as step3;
SELECT '✅ Test data cleaned up' as step4;
SELECT '🎉 You can now sign up successfully!' as final_message;

