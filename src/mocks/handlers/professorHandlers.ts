import { http, HttpResponse } from 'msw'
import { getCourseDB } from '../fixtures/db'

// 인메모리 토큰 저장소: token → professorName
const professorTokenStore = new Map<string, string>()

export const professorHandlers = [
  // POST /auth/professor/login — 교수 로그인
  http.post('/auth/professor/login', async ({ request }) => {
    const body = await request.json() as { professorId: string; password: string }
    const { professorId, password } = body

    // courseDB에서 고유 professorName 추출
    const professors = [...new Set(getCourseDB().map((c) => c.professorName))]

    const matched = professors.find((name) => name === professorId)

    if (!matched || password !== 'Prof1234!') {
      return HttpResponse.json(
        { message: '교수 ID 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    const token = `prof-token-${matched}-${Date.now()}`
    professorTokenStore.set(token, matched)

    return HttpResponse.json({ token, professorName: matched }, { status: 200 })
  }),

  // GET /professor/courses — 담당 강의 목록 조회
  http.get('/professor/courses', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const professorName = professorTokenStore.get(token)

    if (!professorName) {
      return HttpResponse.json({ message: '유효하지 않은 토큰입니다.' }, { status: 401 })
    }

    const courses = getCourseDB().filter((c) => c.professorName === professorName)
    return HttpResponse.json(courses)
  }),
]
