-- ========================================
-- Fix RLS issues for ALL tables at once
-- ========================================

-- 1. Enable RLS on ALL public tables
-- ========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 2. Verify RLS is enabled on all tables
-- ========================================
-- Run this query to check RLS status:
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Check existing policies for each table
-- ========================================
-- This shows all policies currently applied:
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies  
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. Summary of what each table should have:
-- ========================================
-- users table:
--   ✓ "Users can view own profile" 
--   ✓ "Users can update own profile"
--
-- spaces table:
--   ✓ "Users can view their spaces"
--   ✓ "Users can create spaces"
--   ✓ "Owners can update spaces"
--
-- space_members table:
--   ✓ "Users can view space memberships"
--   ✓ "Users can insert themselves as space members"
--   ✓ "Space owners can manage members"
--
-- events table:
--   ✓ "Users can view events in their spaces"
--   ✓ "Users can create events in their spaces"
--   ✓ "Users can update their own events"
--   ✓ "Users can delete their own events"