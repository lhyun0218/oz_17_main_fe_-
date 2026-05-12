# Requirements Document

## Introduction

현규대학교 LMS에 교수 로그인 및 강의 채팅 Q&A 기능을 추가한다.
현재 관리자 전용으로만 운영되는 `/admin/login` 페이지에 교수용 탭을 추가하고,
교수가 담당 강의의 학생 채팅 메시지를 확인하고 답변할 수 있는 전용 대시보드(`/professor`)를 제공한다.
또한 기존 학생용 강의 채팅(`ChatPanel`)에서 교수 답변이 시각적으로 구분되어 표시되며,
채팅 메시지는 localStorage에 영구 저장되어 새로고침 후에도 유지된다.

## Glossary

- **Professor_Auth_System**: 교수 인증 및 세션 관리를 담당하는 시스템 (Zustand persist 기반)
- **Professor_Dashboard**: 교수가 담당 강의 목록과 학생 채팅 Q&A를 관리하는 전용 페이지 (`/professor`)
- **Chat_Store**: 강의별 채팅 메시지를 localStorage에 영구 저장하고 조회·추가하는 MSW 핸들러 내 저장소
- **ChatPanel**: 학생이 강의 시청 중 채팅 메시지를 보내고 받는 기존 React 컴포넌트
- **Professor_Message**: `isProfessor: true` 플래그가 설정된 채팅 메시지로, 교수가 전송한 답변
- **courseDB**: `src/mocks/fixtures/db.ts`에 정의된 강의 데이터로, `professorName` 필드를 포함
- **Admin_Login_Page**: `/admin/login` 경로의 기존 관리자 로그인 페이지

---

## Requirements

### Requirement 1: 교수 로그인

**User Story:** 교수로서, 관리자 로그인 페이지에서 교수 계정으로 로그인하여 교수 전용 대시보드에 접근하고 싶다.

#### Acceptance Criteria

1. THE Admin_Login_Page SHALL 관리자 탭과 교수 탭 두 개의 탭을 렌더링한다.
2. WHEN 교수 탭이 선택된 상태에서 사용자가 교수 ID와 비밀번호를 입력하고 로그인 버튼을 클릭하면, THE Professor_Auth_System SHALL `/auth/professor/login` 엔드포인트에 인증 요청을 전송한다.
3. WHEN 인증 요청이 성공하면, THE Professor_Auth_System SHALL 교수 이름과 인증 토큰을 localStorage에 저장하고 `/professor` 경로로 이동한다.
4. IF 교수 ID 또는 비밀번호가 일치하지 않으면, THEN THE Professor_Auth_System SHALL 로그인 폼에 오류 메시지를 표시한다.
5. THE Professor_Auth_System SHALL 교수 인증 상태를 Zustand persist 미들웨어를 통해 localStorage에 유지하여 새로고침 후에도 로그인 상태가 보존되도록 한다.
6. WHEN 교수가 로그아웃하면, THE Professor_Auth_System SHALL localStorage에서 교수 인증 정보를 삭제하고 `/admin/login` 경로로 이동한다.
7. THE Professor_Auth_System SHALL courseDB의 `professorName` 값을 기반으로 교수 계정을 식별하며, 비밀번호는 `Prof1234!`로 통일한다.

---

### Requirement 2: 교수 전용 대시보드

**User Story:** 교수로서, 내 담당 강의 목록과 각 강의의 학생 질문을 한 화면에서 확인하고 싶다.

#### Acceptance Criteria

1. WHEN 인증된 교수가 `/professor` 경로에 접근하면, THE Professor_Dashboard SHALL 해당 교수의 `professorName`과 일치하는 강의 목록을 표시한다.
2. WHEN 교수가 강의 목록에서 특정 강의를 선택하면, THE Professor_Dashboard SHALL 해당 강의의 채팅 메시지 목록을 시간 오름차순으로 표시한다.
3. THE Professor_Dashboard SHALL 각 채팅 메시지에 대해 작성자 이름, 전송 시각, 메시지 내용을 표시한다.
4. THE Professor_Dashboard SHALL 답변 입력 폼을 제공하며, 폼은 텍스트 입력 영역과 전송 버튼을 포함한다.
5. WHEN 교수가 답변을 입력하고 전송 버튼을 클릭하면, THE Professor_Dashboard SHALL `authorName`을 교수 이름으로 설정하고 `isProfessor: true` 플래그를 포함하여 채팅 메시지를 전송한다.
6. WHEN 답변 전송이 성공하면, THE Professor_Dashboard SHALL 채팅 메시지 목록을 즉시 갱신하고 입력 폼을 초기화한다.
7. IF 인증되지 않은 사용자가 `/professor` 경로에 접근하면, THEN THE Professor_Dashboard SHALL `/admin/login` 경로로 리다이렉트한다.
8. THE Professor_Dashboard SHALL 답변 입력 텍스트가 500자를 초과하지 않도록 제한한다.

---

### Requirement 3: 채팅 메시지 localStorage 영구 저장

**User Story:** 학생 및 교수로서, 페이지를 새로고침하거나 브라우저를 재시작한 후에도 이전 채팅 메시지가 유지되기를 원한다.

#### Acceptance Criteria

1. THE Chat_Store SHALL 채팅 메시지를 인메모리 저장소 대신 localStorage 키 `mock-db-chat-messages`에 강의 ID별로 저장한다.
2. WHEN MSW 핸들러가 초기화될 때, THE Chat_Store SHALL localStorage에 저장된 채팅 메시지를 불러오고, 저장된 데이터가 없으면 `mockChatMessagesByCourse`의 초기 데이터를 사용한다.
3. WHEN 새 채팅 메시지가 추가되면, THE Chat_Store SHALL 해당 강의의 전체 메시지 배열을 localStorage에 즉시 저장한다.
4. THE Chat_Store SHALL 기존 `ChatMessage` 타입에 `isProfessor` 불리언 필드를 추가하여 교수 메시지를 식별한다.
5. WHEN `GET /chat/:courseId/messages` 요청이 수신되면, THE Chat_Store SHALL localStorage에서 해당 강의의 메시지 배열을 읽어 반환한다.
6. WHEN `POST /chat/:courseId/messages` 요청이 수신되면, THE Chat_Store SHALL 요청 본문의 `isProfessor` 필드를 메시지에 포함하여 저장한다.

---

### Requirement 4: 학생 채팅 패널에서 교수 메시지 시각적 구분

**User Story:** 학생으로서, 강의 채팅에서 교수의 답변을 일반 학생 메시지와 시각적으로 구분하여 쉽게 식별하고 싶다.

#### Acceptance Criteria

1. WHEN ChatPanel이 메시지 목록을 렌더링할 때, THE ChatPanel SHALL `isProfessor: true`인 메시지의 작성자 이름을 금색(`text-yellow-400`)으로 표시한다.
2. WHEN ChatPanel이 메시지 목록을 렌더링할 때, THE ChatPanel SHALL `isProfessor: true`인 메시지의 배경에 금색 계열의 강조 스타일을 적용하여 일반 메시지와 구분한다.
3. THE ChatPanel SHALL `isProfessor: true`인 메시지에 "교수" 배지(badge) 레이블을 작성자 이름 옆에 표시한다.
4. WHILE 채팅 폴링이 활성화된 상태에서, THE ChatPanel SHALL 3초 간격으로 메시지 목록을 갱신하여 교수 답변이 실시간에 준하여 표시되도록 한다.

---

### Requirement 5: 교수 인증 API (MSW 핸들러)

**User Story:** 시스템으로서, 교수 로그인 요청을 처리하고 유효한 인증 토큰을 반환해야 한다.

#### Acceptance Criteria

1. WHEN `POST /auth/professor/login` 요청이 수신되면, THE Professor_Auth_System SHALL 요청 본문의 `professorId`와 `password`를 검증한다.
2. WHEN 자격증명이 유효하면, THE Professor_Auth_System SHALL `{ token, professorName }` 형태의 JSON 응답을 HTTP 200 상태 코드와 함께 반환한다.
3. IF 자격증명이 유효하지 않으면, THEN THE Professor_Auth_System SHALL HTTP 401 상태 코드와 오류 메시지를 반환한다.
4. THE Professor_Auth_System SHALL courseDB에 존재하는 모든 고유한 `professorName` 값에 대해 교수 계정을 동적으로 생성하며, `professorId`는 `professorName`과 동일한 값으로 처리한다.
5. WHEN `GET /professor/courses` 요청이 수신되면, THE Professor_Auth_System SHALL 요청 헤더의 `Authorization` 토큰을 검증하고, 해당 교수의 담당 강의 목록을 courseDB에서 조회하여 반환한다.
6. IF `Authorization` 헤더가 없거나 유효하지 않으면, THEN THE Professor_Auth_System SHALL HTTP 401 상태 코드를 반환한다.
