import { http, HttpResponse } from 'msw'
import { getStudentDB, studentDB, persistDB } from '../fixtures/db'

// ─── localStorage 기반 비밀번호 저장소 ───────────────────────
// 새로고침 후에도 회원가입한 계정이 유지됩니다.
const PASSWORDS_KEY = 'mock-registered-passwords'

function loadPasswords(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PASSWORDS_KEY)
    return raw ? JSON.parse(raw) : { '20240001': 'Test1234!' }
  } catch {
    return { '20240001': 'Test1234!' }
  }
}

function savePasswords(passwords: Record<string, string>): void {
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords))
}

// 초기 기본 계정이 없으면 세팅
const initial = loadPasswords()
if (!initial['20240001']) {
  initial['20240001'] = 'Test1234!'
  savePasswords(initial)
}

// ─── localStorage 기반 isRegistered 저장소 ───────────────────
const REGISTERED_KEY = 'mock-registered-students'

function loadRegistered(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(REGISTERED_KEY)
    return raw ? JSON.parse(raw) : { '20240001': true }
  } catch {
    return { '20240001': true }
  }
}

function saveRegistered(registered: Record<string, boolean>): void {
  localStorage.setItem(REGISTERED_KEY, JSON.stringify(registered))
}

// studentDB의 isRegistered를 localStorage 기준으로 동기화
const registeredMap = loadRegistered()
getStudentDB().forEach((s) => {
  if (registeredMap[s.studentId] !== undefined) {
    s.isRegistered = registeredMap[s.studentId]
  }
})

export const authHandlers = [
  // POST /auth/login (학생) — 동적 계정 지원
  http.post('/auth/login', async ({ request }) => {
    const body = await request.json() as { studentId: string; password: string }
    const { studentId, password } = body

    const passwords = loadPasswords()
    const storedPassword = passwords[studentId]
    if (storedPassword && storedPassword === password) {
      const student = getStudentDB().find((s) => s.studentId === studentId)
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

  // POST /auth/signup/verify — 항상 최신 studentDB 기준으로 확인
  http.post('/auth/signup/verify', async ({ request }) => {
    const body = await request.json() as { studentId: string; name: string }
    const { studentId, name } = body

    const registered = loadRegistered()
    if (registered[studentId]) {
      return HttpResponse.json({ message: '이미 가입된 학번입니다' }, { status: 409 })
    }

    const student = getStudentDB().find(
      (s) => s.studentId === studentId && s.name === name && s.status !== '제적'
    )

    if (!student) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json({ verified: true })
  }),

  // POST /auth/signup — 가입 완료 시 비밀번호 + isRegistered를 localStorage에 저장
  http.post('/auth/signup', async ({ request }) => {
    const body = await request.json() as { studentId: string; name: string; password: string }

    // 비밀번호 저장
    const passwords = loadPasswords()
    passwords[body.studentId] = body.password
    savePasswords(passwords)

    // isRegistered 저장
    const registered = loadRegistered()
    registered[body.studentId] = true
    saveRegistered(registered)

    // studentDB 메모리도 동기화
    const current = getStudentDB()
    const student = current.find((s) => s.studentId === body.studentId)
    if (student) {
      student.isRegistered = true
      studentDB.length = 0
      studentDB.push(...current)
      persistDB.students()
    }

    return new HttpResponse(null, { status: 201 })
  }),
]
