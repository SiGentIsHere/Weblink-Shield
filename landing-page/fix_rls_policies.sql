-- =====================================================
-- FIX RLS POLICIES FOR USER SIGNUP
-- =====================================================
-- This script adds the missing INSERT policy for the User table
-- Run this in your Supabase SQL Editor

-- Add INSERT policy to allow users to create their own profile
CREATE POLICY "Users can insert own profile" ON "User"
    FOR INSERT 
    WITH CHECK (auth.uid()::text = auth_user_id::text);

-- Also ensure users can insert their own subscription
CREATE POLICY "Users can insert own subscription" ON Subscription
    FOR INSERT 
    WITH CHECK (
        user_id IN (
            SELECT user_id FROM "User" WHERE auth_user_id = auth.uid()
        )
    );

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies
WHERE tablename IN ('User', 'Subscription')
ORDER BY tablename, cmd;

