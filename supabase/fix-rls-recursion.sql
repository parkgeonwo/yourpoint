-- =============================================
-- Fix infinite recursion in space_members table
-- =============================================

-- 1. First, drop existing problematic policies
DROP POLICY IF EXISTS "Users can view space memberships" ON public.space_members;
DROP POLICY IF EXISTS "Users can insert themselves as space members" ON public.space_members;
DROP POLICY IF EXISTS "Space owners can manage members" ON public.space_members;

-- 2. Create new, non-recursive policies for space_members
-- =============================================

-- Policy 1: Users can view their own memberships (simple, no recursion)
CREATE POLICY "Users can view own memberships" 
ON public.space_members
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Users can view all members of spaces they belong to
CREATE POLICY "Users can view members in their spaces" 
ON public.space_members
FOR SELECT 
USING (
  space_id IN (
    SELECT sm.space_id 
    FROM public.space_members sm 
    WHERE sm.user_id = auth.uid()
  )
);

-- Policy 3: Space owners can insert new members
CREATE POLICY "Space owners can add members" 
ON public.space_members
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.spaces s 
    WHERE s.id = space_id 
    AND s.owner_id = auth.uid()
  )
);

-- Policy 4: Users can insert themselves as members (for accepting invites)
CREATE POLICY "Users can join spaces" 
ON public.space_members
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy 5: Space owners can update member roles
CREATE POLICY "Space owners can update members" 
ON public.space_members
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.spaces s 
    WHERE s.id = space_id 
    AND s.owner_id = auth.uid()
  )
);

-- Policy 6: Space owners can remove members
CREATE POLICY "Space owners can remove members" 
ON public.space_members
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.spaces s 
    WHERE s.id = space_id 
    AND s.owner_id = auth.uid()
  )
);

-- Policy 7: Users can remove themselves from spaces
CREATE POLICY "Users can leave spaces" 
ON public.space_members
FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Verify the new policies
-- =============================================
SELECT 
    policyname,
    permissive,
    cmd,
    qual::text as using_clause,
    with_check::text as with_check_clause
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'space_members'
ORDER BY policyname;