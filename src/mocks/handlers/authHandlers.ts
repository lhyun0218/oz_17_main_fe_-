import { http, HttpResponse } from 'msw'
import { getStudentDB, persistDB } from '../fixtures/db'

const PASSWORDS_KEY = 'mock-registered-passwords'
const REGISTERED_KEY = 'mock-registered-students'

function loadPasswords(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PASSWORDS_KEY)
    const data = raw ? JSON.parse(raw) : {}
    if (!data['20240001']) data['20240001'] = 'Test1234!'
    return data
  } catch {
    return { '20240001': 'Test1234!' }
  }
}

function savePasswords(passwords: Record<string, string>): void {
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords))
}

function loadRegistered(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(REGISTERED_KEY)
    const data = raw ? JSON.parse(raw) : {}
    if (data['20240001'] === undefined) data['20240001'] = true
    return data
  } catch {
    return { '20240001': true }
  }
}

function saveRegistered(registered: Record<string, boolean>): void {
  localStorage.setItem(REGISTERED_KEY, JSON.stringify(registered))
}

export const authHandlers = [
  // POST /auth/login
  http.post('/auth/login', async ({ request }) => {
    const body = await request.json() as { studentId: string; password: string }
    const { studentId, password } = body

    const passwords = loadPasswords()
    if (passwords[studentId] && passwords[studentId] === password) {
      const student = getStudentDB().find((s) => s.studentId === studentId)
      return HttpResponse.json({
        token: `mock-jwt-token-${studentId}`,
        user: { studentId, name: student?.name ?? '학생' },
      })
    }
    return new HttpResponse(null, { status: 401 })
  }),

  // POST /auth/admin/login
  http.post('/auth/admin/login', async ({ request }) => {
    const body = await request.json() as { adminId: string; password: string }
    if (body.adminId === 'admin' && body.password === 'Admin1234!') {
      return HttpResponse.json({
        token: 'mock-admin-jwt-token',
        admin: { adminId: body.adminId, name: '관리자' },
      })
    }
    return new HttpResponse(null, { status: 401 })
  }),

  // POST /auth/signup/verify
  http.post('/auth/signup/verify', async ({ request }) => {
    const body = await request.json() as { studentId: string; name: string }
    const { studentId, name } = body

    const registered = loadRegistered()
    if (registered[studentId]) {
      return HttpResponse.json({ message: '이미 가입된 학번입니다' }, { status: 409 })
    }

    // 항상 최신 studentDB에서 확인
    const student = getStudentDB().find(
      (s) => s.studentId === studentId && s.name === name && s.status !== '제적'
    )
    if (!student) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json({ verified: true })
  }),

  // POST /auth/signup
  http.post('/auth/signup', async ({ request }) => {
    const body = await request.json() as { studentId: string; name: string; password: string }

    const passwords = loadPasswords()
    passwords[body.studentId] = body.password
    savePasswords(passwords)

    const registered = loadRegistered()
    registered[body.studentId] = true
    saveRegistered(registered)

    // studentDB에도 isRegistered 반영 후 저장
    const students = getStudentDB()
    const student = students.find((s) => s.studentId === body.studentId)
    if (student) {
      student.isRegistered = true
      persistDB.students(students)
    }

    return new HttpResponse(null, { status: 201 })
  }),
]
