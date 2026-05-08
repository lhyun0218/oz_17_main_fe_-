# Bugfix Requirements Document

## Introduction

이 문서는 인증 및 과제 제출 흐름에서 발견된 세 가지 버그를 수정하기 위한 요구사항을 정의합니다.

- **버그 1**: 로그인 시 잘못된 비밀번호 입력(401 응답)이 세션 만료 처리로 잘못 분류되어 로그인 자체가 불가능해지는 문제
- **버그 2**: 페이지 새로고침 시 `isAuthenticated`가 토큰 유효성과 무관하게 잘못 복원되는 타이밍 이슈
- **버그 3**: 과제 제출 후 `isSubmitted` 상태가 mock 데이터에 반영되지 않아 이후 조회 시 제출 전 상태로 반환되는 문제

---

## Bug Analysis

---

### Bug 1: 로그인 401 응답 시 세션 만료 처리 오작동

#### Current Behavior (Defect)

1.1 WHEN 사용자가 `/auth/login` 엔드포인트에 잘못된 비밀번호로 로그인을 시도하여 401 응답이 반환될 때 THEN 시스템은 `logout()`을 실행하고 `/login?expired=true`로 리다이렉트하여 로그인 페이지 자체를 사용할 수 없게 만든다

1.2 WHEN 인증이 필요한 API 요청(`/auth/login` 이외의 경로)에서 401 응답이 반환될 때 THEN 시스템은 `logout()`을 실행하고 `/login?expired=true`로 리다이렉트한다

#### Expected Behavior (Correct)

2.1 WHEN 사용자가 `/auth/login` 엔드포인트에 잘못된 비밀번호로 로그인을 시도하여 401 응답이 반환될 때 THEN 시스템은 세션 만료 처리를 실행하지 않고 에러를 그대로 호출자에게 전달하여 로그인 폼에서 오류 메시지를 표시할 수 있도록 SHALL 한다

2.2 WHEN 인증이 필요한 API 요청(`/auth/login` 이외의 경로)에서 401 응답이 반환될 때 THEN 시스템은 `logout()`을 실행하고 `/login?expired=true`로 리다이렉트하는 세션 만료 처리를 SHALL 수행한다

#### Unchanged Behavior (Regression Prevention)

3.1 WHEN 인증된 사용자가 보호된 API를 호출하고 200 응답이 반환될 때 THEN 시스템은 SHALL CONTINUE TO 정상적으로 응답 데이터를 반환한다

3.2 WHEN 인증된 사용자의 토큰이 만료되어 `/auth/login` 이외의 경로에서 401이 반환될 때 THEN 시스템은 SHALL CONTINUE TO 세션 만료 처리(`logout()` + `/login?expired=true` 리다이렉트)를 수행한다

3.3 WHEN 모든 API 요청이 전송될 때 THEN 시스템은 SHALL CONTINUE TO 요청 헤더에 저장된 JWT 토큰을 자동으로 첨부한다

---

### Bug 2: 페이지 새로고침 시 isAuthenticated 잘못 복원

#### Current Behavior (Defect)

1.3 WHEN 사용자가 로그인 후 페이지를 새로고침할 때 THEN 시스템은 `partialize`로 `token`만 persist하므로 rehydrate 직후 `isAuthenticated`가 초기값 `false`로 유지되다가 `onRehydrateStorage` 콜백에서 `true`로 변경되는 타이밍 이슈가 발생한다

1.4 WHEN 만료된 토큰이 localStorage에 저장된 상태에서 페이지를 새로고침할 때 THEN 시스템은 토큰 유효성 검증 없이 `isAuthenticated`를 `true`로 설정한다

#### Expected Behavior (Correct)

2.3 WHEN 사용자가 로그인 후 페이지를 새로고침할 때 THEN 시스템은 rehydrate 완료 시점에 `token`의 존재 여부를 기반으로 `isAuthenticated`를 일관되게 SHALL 복원한다

2.4 WHEN 유효한 토큰이 localStorage에 저장된 상태에서 페이지를 새로고침할 때 THEN 시스템은 `isAuthenticated`를 `true`로 SHALL 설정한다

2.5 WHEN 토큰이 없는 상태에서 페이지를 새로고침할 때 THEN 시스템은 `isAuthenticated`를 `false`로 SHALL 유지한다

#### Unchanged Behavior (Regression Prevention)

3.4 WHEN 사용자가 올바른 자격증명으로 로그인에 성공할 때 THEN 시스템은 SHALL CONTINUE TO `token`과 `isAuthenticated: true`를 스토어에 설정한다

3.5 WHEN 사용자가 로그아웃할 때 THEN 시스템은 SHALL CONTINUE TO `token`, `user`, `isAuthenticated`를 초기화한다

3.6 WHEN 보호된 라우트에 접근할 때 THEN 시스템은 SHALL CONTINUE TO `isAuthenticated` 상태를 기반으로 접근 허용 여부를 판단한다

---

### Bug 3: 과제 제출 후 isSubmitted 상태 미반영

#### Current Behavior (Defect)

1.5 WHEN 사용자가 특정 과제에 대해 `POST /assignments/:id/submit`을 호출할 때 THEN 시스템은 201 응답만 반환하고 `mockAssignments` 배열 내 해당 과제의 `isSubmitted`를 `true`로 업데이트하지 않는다

1.6 WHEN 과제 제출 후 `GET /assignments/:id`를 다시 호출할 때 THEN 시스템은 `isSubmitted: false`를 반환하여 제출이 반영되지 않은 것처럼 응답한다

#### Expected Behavior (Correct)

2.6 WHEN 사용자가 특정 과제에 대해 `POST /assignments/:id/submit`을 호출할 때 THEN 시스템은 201 응답을 반환하고 `mockAssignments` 배열 내 해당 과제의 `isSubmitted`를 `true`로 SHALL 업데이트한다

2.7 WHEN 과제 제출 후 `GET /assignments/:id`를 다시 호출할 때 THEN 시스템은 `isSubmitted: true`를 포함한 최신 과제 상태를 SHALL 반환한다

#### Unchanged Behavior (Regression Prevention)

3.7 WHEN 존재하지 않는 과제 ID로 `GET /assignments/:id`를 호출할 때 THEN 시스템은 SHALL CONTINUE TO 404 응답을 반환한다

3.8 WHEN 이미 제출된 과제에 대해 `GET /assignments/:id`를 호출할 때 THEN 시스템은 SHALL CONTINUE TO `submittedAt` 필드를 포함하여 반환한다

3.9 WHEN 과제 제출 성공 시 THEN 시스템은 SHALL CONTINUE TO `useAssignmentSubmit` 훅의 `onSuccess` 콜백에서 성공 메시지를 표시한다

---

## Bug Condition Summary

### Bug 1 — 버그 조건 함수

```pascal
FUNCTION isBugCondition_Bug1(request)
  INPUT: request of type AxiosRequestConfig
  OUTPUT: boolean

  // /auth/login 경로의 요청에서 401이 발생한 경우
  RETURN request.url CONTAINS '/auth/login'
         AND response.status = 401
END FUNCTION

// Property: Fix Checking
FOR ALL request WHERE isBugCondition_Bug1(request) DO
  result ← responseInterceptor'(request)
  ASSERT logout() NOT called
         AND redirect('/login?expired=true') NOT called
         AND error IS propagated to caller
END FOR

// Property: Preservation Checking
FOR ALL request WHERE NOT isBugCondition_Bug1(request) AND response.status = 401 DO
  ASSERT F(request) = F'(request)  // 세션 만료 처리 동일하게 수행
END FOR
```

### Bug 2 — 버그 조건 함수

```pascal
FUNCTION isBugCondition_Bug2(storageState)
  INPUT: storageState of type PersistedAuthState
  OUTPUT: boolean

  // rehydrate 시점에 isAuthenticated가 token 존재 여부와 불일치하는 경우
  RETURN storageState.token EXISTS
         AND storageState.isAuthenticated = false  // 타이밍 이슈
         OR storageState.token IS NULL
            AND storageState.isAuthenticated = true  // 만료 토큰 이슈
END FUNCTION

// Property: Fix Checking
FOR ALL storageState WHERE isBugCondition_Bug2(storageState) DO
  result ← rehydrate'(storageState)
  ASSERT result.isAuthenticated = (result.token IS NOT NULL)
END FOR

// Property: Preservation Checking
FOR ALL storageState WHERE NOT isBugCondition_Bug2(storageState) DO
  ASSERT F(storageState) = F'(storageState)
END FOR
```

### Bug 3 — 버그 조건 함수

```pascal
FUNCTION isBugCondition_Bug3(request)
  INPUT: request of type HttpRequest
  OUTPUT: boolean

  // 제출 후 GET 조회 시 isSubmitted가 false인 경우
  RETURN request.method = 'POST'
         AND request.url MATCHES '/assignments/:id/submit'
END FUNCTION

// Property: Fix Checking
FOR ALL request WHERE isBugCondition_Bug3(request) DO
  submitResult ← submitHandler'(request)
  getResult ← getHandler'(request.id)
  ASSERT submitResult.status = 201
         AND getResult.isSubmitted = true
END FOR

// Property: Preservation Checking
FOR ALL request WHERE NOT isBugCondition_Bug3(request) DO
  ASSERT F(request) = F'(request)
END FOR
```
