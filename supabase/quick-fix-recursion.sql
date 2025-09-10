-- =============================================
-- QUICK FIX: 무한 재귀 문제 긴급 해결
-- =============================================
-- 이 스크립트를 먼저 실행하세요!

-- 1. 문제가 되는 정책만 삭제
DROP POLICY IF EXISTS "Space owners can manage members" ON public.space_members;

-- 2. 더 간단한 정책으로 교체
CREATE POLICY "Space owners can manage members_v2" 
ON public.space_members
FOR ALL 
USING (
  -- 스페이스 소유자인지 직접 확인 (space_members를 참조하지 않음)
  EXISTS (
    SELECT 1 
    FROM public.spaces 
    WHERE id = space_members.space_id 
    AND owner_id = auth.uid()
  )
);

-- 3. 확인 쿼리
SELECT COUNT(*) as policy_count 
FROM pg_policies 
WHERE tablename = 'space_members' 
AND schemaname = 'public';