-- ========================================
-- RLS 상태 점검 스크립트
-- ========================================

-- 1. 현재 RLS 상태 확인 (실행 전)
-- ========================================
SELECT 
    '===== BEFORE FIX =====' as status,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled - SECURITY RISK!'
    END as rls_status,
    CASE 
        WHEN rowsecurity = false THEN 'ALTER TABLE public.' || tablename || ' ENABLE ROW LEVEL SECURITY;'
        ELSE 'Already enabled'
    END as fix_command
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. RLS가 비활성화된 테이블만 보기
-- ========================================
SELECT 
    tablename as "테이블명",
    '⚠️ RLS 비활성화됨' as "보안 상태"
FROM pg_tables
WHERE schemaname = 'public' 
  AND rowsecurity = false;

-- 3. 각 테이블의 정책 개수 확인
-- ========================================
SELECT 
    t.tablename as "테이블",
    CASE 
        WHEN t.rowsecurity THEN '✅'
        ELSE '❌'
    END as "RLS",
    COUNT(p.policyname) as "정책 수",
    STRING_AGG(p.policyname, ', ') as "정책 목록"
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.schemaname = 'public'
WHERE t.schemaname = 'public'
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;