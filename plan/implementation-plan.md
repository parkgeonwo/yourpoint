# implementation-plan.md

### **6단계 개발 로드맵**

#### **Phase 1: "첫 방문자가 우리 서비스를 이해할 수 있다" (기반 다지기)**
* **목표:** 프로젝트 초기 설정 및 기본 화면 구현.
* **🎨 UI:**
    * **작업:** Splash Screen, Landing/Onboarding Screen UI 구현.
    * **파일:** `screens/SplashScreen.js`, `screens/OnboardingScreen.js`
* **⚙️ Backend:**
    * **작업:** Supabase 프로젝트 생성, 데이터베이스 테이블 기본 구조 설계 (Users, Spaces).
    * **문서:** `supabase/schema.sql` (초안)
* **🔗 Integration:**
    * **작업:** React Native (Expo) 프로젝트에 Supabase 클라이언트 연동.
    * **파일:** `lib/supabase.js`
* **🧪 Testing:**
    * **내용:** 앱이 정상적으로 실행되고 첫 화면이 보이는지 확인.

---

#### **Phase 2: "사용자가 가입하고 로그인할 수 있다" (인증 시스템)**
* **목표:** 사용자가 계정을 만들고 앱에 들어올 수 있게 한다.
* **🎨 UI:**
    * **작업:** 로그인/회원가입 화면 UI 구현.
    * **파일:** `screens/Auth/LoginScreen.js`, `screens/Auth/SignUpScreen.js`
* **⚙️ Backend:**
    * **작업:** Supabase Auth 설정 (소셜 로그인 - Google, Kakao 등).
    * **문서:** Supabase Dashboard > Authentication 설정.
* **🔗 Integration:**
    * **작업:** UI와 Supabase Auth 연동, 로그인/로그아웃 로직 구현.
    * **파일:** `hooks/useAuth.js`
* **🛡️ Security:**
    * **내용:** 이메일, 비밀번호 등 민감 정보 처리 규칙 확인.
* **🧪 Testing:**
    * **내용:** 소셜 로그인 성공/실패, 로그아웃 기능 단위 테스트.

---

#### **Phase 3: "사용자가 핵심 기능을 사용할 수 있다" (MVP 핵심 기능)**
* **목표:** 공유 캘린더와 스페이스 기능을 구현한다.
* **🎨 UI:**
    * **작업:** 메인 캘린더 화면, 일정 추가/수정/삭제 Modal, 스페이스 생성/초대 화면 UI 구현.
    * **파일:** `screens/Main/CalendarScreen.js`, `components/EventModal.js`, `screens/Space/CreateSpaceScreen.js`
* **⚙️ Backend:**
    * **작업:** `Events`, `Spaces`, `SpaceMembers` 테이블 스키마 확정 및 RLS(Row Level Security) 설정.
    * **문서:** `supabase/schema.sql` (확정)
* **🔗 Integration:**
    * **작업:** 캘린더 UI와 DB 연동 (일정 CRUD), 스페이스 생성 및 멤버 초대 로직 구현.
    * **파일:** `services/calendarService.js`, `services/spaceService.js`
* **🧪 Testing:**
    * **내용:** 일정 생성 후 다른 멤버에게 보이는지 통합 테스트.

---

#### **Phase 4: "사용자가 완전한 경험을 할 수 있다" (고급 기능)**
* **목표:** 프로필 관리, 푸시 알림, 기념일 기능 추가.
* **🎨 UI:**
    * **작업:** 프로필 수정 화면, 기념일 목록 화면 UI 구현.
    * **파일:** `screens/Profile/EditProfileScreen.js`, `screens/AnniversaryScreen.js`
* **⚙️ Backend:**
    * **작업:** `Anniversaries` 테이블 생성, Supabase Edge Function을 이용한 푸시 알림 로직 구현.
* **🔗 Integration:**
    * **작업:** 프로필 정보 업데이트, 기념일 D-Day 계산 로직, 특정 시간에 푸시 알림 보내기 기능 연동.
    * **파일:** `services/profileService.js`, `supabase/functions/push-notification/index.ts`
* **🧪 Testing:**
    * **내용:** 프로필 사진 변경, 지정된 시간에 알림이 오는지 E2E 테스트.

---

#### **Phase 5: "실제 사용자가 문제없이 접근할 수 있다" (배포 및 최적화)**
* **목표:** 앱 스토어에 앱을 출시한다.
* **⚙️ Backend:**
    * **작업:** Supabase 프로젝트 Production 설정 (백업, DB 인스턴스 등).
* **🔗 Integration:**
    * **작업:** Expo Application Services (EAS) 설정, 빌드 및 배포 자동화 (CI/CD).
* **🛡️ Security:**
    * **내용:** 모든 데이터 통신 암호화 확인, 스토어 등록 정책 준수.
* **🧪 Testing:**
    * **내용:** TestFlight(iOS), Internal Testing(Android)을 통한 베타 테스트.

---

#### **Phase 6: "서비스가 성장하고 발전할 수 있다" (운영 및 유지보수)**
* **목표:** 사용자 피드백을 받고 서비스를 개선한다.
* **⚙️ Backend:**
    * **작업:** 사용자 행동 분석을 위한 로그 수집 시스템 구축 (예: Supabase 로깅, PostHog 연동).
    * **작업:** 정기적인 데이터베이스 백업 및 모니터링.
* **🔗 Integration:**
    * **작업:** 사용자 피드백 채널(인앱 문의, 리뷰) 마련.
* **🎨 UI:**
    * **작업:** 공유 다이어리, 위젯 등 확장 기능 개발 시작.