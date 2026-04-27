import { http, HttpResponse } from 'msw'

// 학적 DB 모킹 데이터
const mockStudents = [
  { studentId: '20240002', name: '홍길동' },
]

// 이미 가입된 학번
const registeredStudents = ['20240001']

export const authHandlers = [
  // POST /auth/login
  http.post('/auth/login', async ({ request }) => {
    const body = await request.json() as { studentId: string; password: string }
    const { studentId, password } = body

    if (studentId === '20240001' && password === 'Test1234!') {
      return HttpResponse.json({
        token: 'mock-jwt-token',
        user: { studentId, name: '이현규' },
      })
    }

    return new HttpResponse(null, { status: 401 })
  }),

  // POST /auth/signup/verify
  http.post('/auth/signup/verify', async ({ request }) => {
    const body = await request.json() as { studentId: string; name: string }
    const { studentId, name } = body

    // 이미 가입된 학번 확인
    if (registeredStudents.includes(studentId)) {
      return HttpResponse.json(
        { message: '이미 가입된 학번입니다' },
        { status: 409 }
      )
    }

    // 학적 정보 일치 확인
    const student = mockStudents.find(
      (s) => s.studentId === studentId && s.name === name
    )

    if (!student) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json({ verified: true })
  }),

  // POST /auth/signup
  http.post('/auth/signup', async () => {
    return new HttpResponse(null, { status: 201 })
  }),
]
