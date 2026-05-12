# Implementation Plan: Professor Chat Q&A

## Overview

교수 로그인, 교수 전용 대시보드, 채팅 localStorage 영구 저장, 학생 채팅 패널 교수 메시지 시각적 구분을 순차적으로 구현한다.
기존 `adminStore` / `AdminLoginPage` / `AdminPage` 패턴을 그대로 따르며, 신규 파일과 수정 파일을 단계별로 추가한다.

## Tasks

- [-] 1. ChatMessage 타입 확장 및 채팅 localStorage 저장소 교체
  - [x] 1.1 `src/features/lecture/types.ts`의 `ChatMessage` 인터페이스에 `isProfessor?: boolean` 필드 추가
    - 기존 필드(`id`, `authorName`, `content`, `createdAt`)는 그대로 유지
    - _Requirements: 3.4_

  - [x] 1.2 `src/mocks/handlers/lectureHandlers.ts`의 인메모리 `chatStore`를 localStorage 기반으로 교체
    - `CHAT_STORAGE_KEY = 'mock-db-chat-messages'` 상수 정의
    - `getChatStore()`: localStorage에서 읽고, 없으면 `mockChatMessagesByCourse` 초기 데이터로 초기화
    - `saveChatStore()`: 전체 store를 localStorage에 즉시 저장
    - `GET /chat/:courseId/messages`: localStorage에서 읽어 반환, `createdAt` 오름차순 정렬 적용
    - `POST /chat/:courseId/messages`: 요청 본문의 `isProfessor` 필드를 포함하여 저장 후 localStorage에 즉시 반영
    - localStorage 읽기/쓰기는 try-catch로 감싸고 실패 시 인메모리 폴백 사용
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6_

  - [ ]* 1.3 Property 3: 채팅 메시지 localStorage 라운드트립 속성 테스트 작성
    - **Property 3: 채팅 메시지 localStorage 라운드트립**
    - **Validates: Requirements 3.3, 3.5, 3.6**
    - `fast-check`의 `fc.string({ minLength: 1, maxLength: 500 })`, `fc.boolean()`, `fc.constantFrom('cs101', 'cs201', 'nu101')`을 사용
    - POST 후 GET 응답에 해당 메시지가 `content`, `isProfessor` 필드 포함하여 존재하는지 검증

  - [ ]* 1.4 Property 6: 채팅 메시지 시간 오름차순 정렬 속성 테스트 작성
    - **Property 6: 채팅 메시지 시간 오름차순 정렬**
    - **Validates: Requirements 2.2**
    - 임의 타임스탬프로 여러 메시지 저장 후 GET 응답의 `createdAt` 순서가 오름차순인지 검증

- [ ] 2. 교수 인증 스토어 및 MSW 핸들러 구현
  - [x] 2.1 `src/store/professorStore.ts` 생성
    - `adminStore.ts`와 동일한 Zustand persist 패턴 사용
    - `ProfessorState` 인터페이스: `isProfessorAuthenticated`, `professorToken`, `professorName`, `setProfessorAuth`, `professorLogout`
    - localStorage 키: `professor-storage`
    - `partialize`로 `professorToken`, `professorName` 저장
    - `onRehydrateStorage`에서 토큰 존재 시 `isProfessorAuthenticated: true`로 복원
    - _Requirements: 1.3, 1.5, 1.6_

  - [x] 2.2 `src/mocks/handlers/professorHandlers.ts` 생성
    - 인메모리 `professorTokenStore: Map<string, string>` (token → professorName) 정의
    - `POST /auth/professor/login`: `getCourseDB()`에서 고유 `professorName` 추출 → `professorId === professorName && password === 'Prof1234!'` 검증 → 성공 시 `{ token, professorName }` HTTP 200 반환, 실패 시 HTTP 401
    - 토큰 형식: `prof-token-${professorName}-${Date.now()}`
    - `GET /professor/courses`: `Authorization` 헤더 검증 → `professorTokenStore`에서 `professorName` 조회 → `getCourseDB().filter(c => c.professorName === name)` 반환, 헤더 없거나 유효하지 않으면 HTTP 401
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 2.3 Property 1: courseDB 기반 교수 계정 동적 생성 속성 테스트 작성
    - **Property 1: courseDB 기반 교수 계정 동적 생성**
    - **Validates: Requirements 1.7, 5.4**
    - `fc.constantFrom(...getCourseDB().map(c => c.professorName))`으로 임의 교수 선택
    - `POST /auth/professor/login` 응답이 HTTP 200이고 `{ token, professorName }` 형태인지 검증

  - [ ]* 2.4 Property 2: 교수별 담당 강의 필터링 속성 테스트 작성
    - **Property 2: 교수별 담당 강의 필터링**
    - **Validates: Requirements 2.1, 5.5**
    - 임의 교수로 로그인 후 `GET /professor/courses` 응답이 해당 교수 강의만 포함하는지, 다른 교수 강의는 없는지 검증

  - [x] 2.5 `src/mocks/handlers/index.ts`에 `professorHandlers` import 및 등록
    - _Requirements: 5.1, 5.5_

- [ ] 3. Checkpoint — 핸들러 및 스토어 동작 확인
  - 모든 테스트가 통과하는지 확인하고, 질문이 있으면 사용자에게 문의한다.

- [ ] 4. AdminLoginPage 교수 탭 추가
  - [x] 4.1 `src/pages/AdminLoginPage.tsx`에 탭 상태 및 교수 로그인 폼 추가
    - `activeTab: 'admin' | 'professor'` 상태 추가
    - 탭 UI: "관리자" / "교수" 두 탭 렌더링
    - 교수 탭 선택 시 교수 로그인 폼 표시 (필드: `professorId`, `password`)
    - 교수 로그인 폼 제출 시 `POST /auth/professor/login` 호출 → 성공 시 `professorStore.setProfessorAuth` 호출 후 `/professor`로 이동
    - 실패 시 "교수 ID 또는 비밀번호가 올바르지 않습니다." 오류 메시지 표시
    - 기존 관리자 로그인 폼은 그대로 유지
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 4.2 AdminLoginPage 단위 테스트 작성
    - 두 탭(관리자/교수)이 렌더링되는지 확인
    - 교수 탭 클릭 시 교수 로그인 폼으로 전환 확인
    - 401 응답 시 오류 메시지 표시 확인
    - _Requirements: 1.1, 1.4_

- [ ] 5. ProfessorPage 구현
  - [x] 5.1 `src/pages/ProfessorPage.tsx` 생성
    - `useProfessorStore`에서 `professorName`, `professorToken`, `professorLogout` 사용
    - `GET /professor/courses` 호출 (Authorization 헤더 포함) → 담당 강의 목록 표시
    - 좌측: 강의 목록 (선택 시 `selectedCourseId` 상태 업데이트)
    - 우측: 선택된 강의의 채팅 메시지 목록 (`GET /chat/:courseId/messages`, 3초 폴링)
    - 각 메시지에 작성자 이름, 전송 시각, 내용 표시
    - 답변 입력 폼: textarea(최대 500자) + 전송 버튼
    - 전송 시 `authorName = professorName`, `isProfessor: true` 포함하여 `POST /chat/:courseId/messages` 호출
    - 전송 성공 후 메시지 목록 즉시 갱신 및 입력 폼 초기화
    - 담당 강의 없을 때 "담당 강의가 없습니다." 안내 메시지 표시
    - 로그아웃 버튼: `professorLogout()` 호출 후 `/admin/login`으로 이동
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.8_

  - [ ]* 5.2 Property 5: 교수 답변 전송 시 isProfessor 플래그 포함 속성 테스트 작성
    - **Property 5: 교수 답변 전송 시 isProfessor 플래그 포함**
    - **Validates: Requirements 2.5**
    - `fc.string({ minLength: 1, maxLength: 500 })`으로 임의 내용 생성
    - 교수 답변 전송 시 POST 요청 본문에 `isProfessor: true`와 `authorName === professorName`이 포함되는지 검증

  - [ ]* 5.3 Property 7: 500자 초과 입력 거부 속성 테스트 작성
    - **Property 7: 500자 초과 입력 거부**
    - **Validates: Requirements 2.8**
    - `fc.string({ minLength: 501, maxLength: 1000 })`으로 임의 긴 문자열 생성
    - textarea에 입력 후 전송 버튼이 비활성화 상태인지 검증

  - [ ]* 5.4 ProfessorPage 단위 테스트 작성
    - 미인증 상태에서 `/professor` 접근 시 `/admin/login` 리다이렉트 확인
    - 강의 선택 후 채팅 패널 표시 확인
    - 전송 성공 후 입력 폼 초기화 확인
    - _Requirements: 2.1, 2.6, 2.7_

- [ ] 6. App.tsx 라우트 및 보호 라우트 추가
  - [x] 6.1 `src/App.tsx`에 `ProfessorProtectedRoute` 컴포넌트 및 `/professor` 라우트 추가
    - `useProfessorStore`에서 `isProfessorAuthenticated` 읽어 미인증 시 `/admin/login`으로 리다이렉트
    - `<Route path="/professor" element={<ProfessorPage />} />` 등록
    - _Requirements: 2.7_

- [ ] 7. ChatPanel 교수 메시지 시각적 구분 렌더링
  - [x] 7.1 `src/features/lecture/components/ChatPanel.tsx`에 교수 메시지 스타일 추가
    - `isProfessor: true`인 메시지의 작성자 이름에 `text-yellow-400` 클래스 적용
    - `isProfessor: true`인 메시지 배경에 `bg-yellow-900/20 border-l-2 border-yellow-500/50 pl-2 rounded` 스타일 적용
    - 작성자 이름 옆에 "교수" 배지 렌더링: `<span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1 rounded">교수</span>`
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 7.2 Property 4: 교수 메시지 스타일 렌더링 속성 테스트 작성
    - **Property 4: 교수 메시지 스타일 렌더링**
    - **Validates: Requirements 4.1, 4.2, 4.3**
    - `fc.record({ id, authorName, content, createdAt, isProfessor: fc.constant(true) })`으로 임의 교수 메시지 생성
    - `ChatPanel` 렌더링 후 작성자 이름 요소에 `text-yellow-400` 클래스, "교수" 배지, `border-yellow-500/50` 스타일 존재 여부 검증

  - [ ]* 7.3 ChatPanel 단위 테스트 작성
    - `isProfessor: false` 메시지에는 교수 배지가 없는지 확인
    - `isProfessor: true` 메시지에는 교수 배지와 금색 스타일이 적용되는지 확인
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 8. Final Checkpoint — 전체 통합 확인
  - 모든 테스트가 통과하는지 확인하고, 질문이 있으면 사용자에게 문의한다.

## Notes

- `*` 표시 서브태스크는 선택 사항으로 MVP 구현 시 건너뛸 수 있다.
- 각 태스크는 이전 태스크를 기반으로 하며, 고아 코드 없이 단계별로 통합된다.
- PBT 라이브러리는 `fast-check`를 사용한다 (프로젝트 기존 TypeScript 환경).
- 각 속성 테스트는 최소 100회 이상 반복 실행한다.
- 교수 계정은 하드코딩 없이 `getCourseDB()`의 `professorName`에서 동적으로 생성된다.
