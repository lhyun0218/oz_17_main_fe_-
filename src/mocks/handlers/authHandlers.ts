import { http, HttpResponse } from 'msw'
import { studentDB } from '../fixtures/students'

// 가입된 계정 비밀번호 저장소 (회원가입 시 등록)
const registeredPasswords: Record<string, string> = {
  '20240001': 'Test1234!', // 기본 테스트 계정
}

export const authHandlers = [
  // POST /auth/login (학생) — 동적 계정 지원
  http.post('/auth/login', async ({ request }) => {
    const body = await request.json() as { studentId: string; password: string }
    const { studentId, password } = body

    const storedPassword = registeredPasswords[studentId]
    if (storedPassword && storedPassword === password) {
      const student = studentDB.find((s) => s.studentId === studentId)
      return HttpResponse.json({
        token: `mock-jwt-token-${studentId}`,
        user: { studentId, name: student?.name ?? '학생' },
      })
    }

    return new HttpResponse(null, { status: 401 })
  }),

  // POST /auth/admin/login (관리자)
  http.post('/auth/admin/login', async ({ request }) => {
    const body = await request.json() as { adminId: string; password: string }
    const { adminId, password } = body

    if (adminId === 'admin' && password === 'Admin1234!') {
      return HttpResponse.json({
        token: 'mock-admin-jwt-token',
        admin: { adminId, name: '관리자' },
      })
    }

    return new HttpResponse(null, { status: 401 })
  }),

  // POST /auth/signup/verify — studentDB 기반으로 동적 확인
  http.post('/auth/signup/verify', async ({ request }) => {
    const body = await request.json() as { studentId: string; name: string }
    const { studentId, name } = body

    const existing = studentDB.find((s) => s.studentId === studentId)
    if (existing?.isRegistered) {
      return HttpResponse.json({ message: '이미 가입된 학번입니다' }, { status: 409 })
    }

    const student = studentDB.find(
      (s) => s.studentId === studentId && s.name === name && s.status !== '제적'
    )

    if (!student) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json({ verified: true })
  }),

  // POST /auth/signup — 가입 완료 시 비밀번호 저장 + isRegistered 업데이트
  http.post('/auth/signup', async ({ request }) => {
    const body = await request.json() as { studentId: string; name: string; password: string }
    const student = studentDB.find((s) => s.studentId === body.studentId)
    if (student) {
      student.isRegistered = true
      // 비밀번호 저장 (이후 로그인에 사용)
      registeredPasswords[body.studentId] = body.password
    }
    return new HttpResponse(null, { status: 201 })
  }),
]
