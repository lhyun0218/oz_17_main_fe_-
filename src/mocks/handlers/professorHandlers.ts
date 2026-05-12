import { http, HttpResponse } from 'msw'
import { getCourseDB } from '../fixtures/db'

// 토큰을 localStorage에 저장 (새로고침 후에도 유지)
const PROF_TOKEN_KEY = 'mock-professor-tokens'

function loadTokenStore(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PROF_TOKEN_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveTokenStore(store: Record<string, string>): void {
  try {
    localStorage.setItem(PROF_TOKEN_KEY, JSON.stringify(store))
  } catch { /* ignore */ }
}

export const professorHandlers = [
  // POST /auth/professor/login — 교수 로그인
  http.post('/auth/professor/login', async ({ request }) => {
    const body = await request.json() as { professorId: string; password: string }
    const { professorId, password } = body

    // courseDB에서 고유 professorName 추출 (항상 최신 데이터)
    const professors = [...new Set(getCourseDB().map((c) => c.professorName))]
    const matched = professors.find((name) => name === professorId)

    if (!matched || password !== 'Prof1234!') {
      return HttpResponse.json(
        { message: '교수 ID 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    const token = `prof-token-${matched}-${Date.now()}`
    const store = loadTokenStore()
    store[token] = matched
    saveTokenStore(store)

    return HttpResponse.json({ token, professorName: matched }, { status: 200 })
  }),

  // GET /professor/courses — 담당 강의 목록 조회
  http.get('/professor/courses', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    // localStorage에서 토큰 검증 (새로고침 후에도 유지)
    const store = loadTokenStore()
    let professorName = store[token]

    // 토큰이 없으면 prof-token-{name}-{timestamp} 형식에서 이름 추출 시도
    if (!professorName && token.startsWith('prof-token-')) {
      const parts = token.split('-')
      // prof-token-{name}-{timestamp} → name은 인덱스 2부터 마지막-1까지
      if (parts.length >= 4) {
        const extracted = parts.slice(2, parts.length - 1).join('-')
        const professors = [...new Set(getCourseDB().map((c) => c.professorName))]
        if (professors.includes(extracted)) {
          professorName = extracted
        }
      }
    }

    if (!professorName) {
      return HttpResponse.json({ message: '유효하지 않은 토큰입니다.' }, { status: 401 })
    }

    const courses = getCourseDB().filter((c) => c.professorName === professorName)
    return HttpResponse.json(courses)
  }),
]
