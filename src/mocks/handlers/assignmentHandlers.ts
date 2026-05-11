import { http, HttpResponse } from 'msw'
import { allAssignments, COURSE_ASSIGNMENTS } from '../fixtures/assignments'
import { enrollmentDB } from '../fixtures/db'

// 제출 상태를 localStorage에 영구 저장
const SUBMITTED_KEY = 'mock-submitted-assignments'

function loadSubmitted(): Record<string, string> {
  try {
    const raw = localStorage.getItem(SUBMITTED_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveSubmitted(data: Record<string, string>): void {
  localStorage.setItem(SUBMITTED_KEY, JSON.stringify(data))
}

// 학생이 수강 중인 강의의 과제 목록 반환
function getAssignmentsForStudent(studentId: string) {
  const enrollments = enrollmentDB.filter((e) => e.studentId === studentId)
  const submitted = loadSubmitted()

  return enrollments.flatMap((e) => {
    const courseAssignments = COURSE_ASSIGNMENTS[e.courseId] ?? []
    return courseAssignments.map((a) => ({
      ...a,
      courseId: e.courseId,
      isSubmitted: !!submitted[a.id],
      submittedAt: submitted[a.id] ?? undefined,
    }))
  })
}

export const assignmentHandlers = [
  // GET /assignments — 수강 중인 강의의 전체 과제 목록
  http.get('/assignments', ({ request }) => {
    const auth = request.headers.get('Authorization') ?? ''
    const studentId = auth.replace('Bearer mock-jwt-token-', '') || '20240001'
    const assignments = getAssignmentsForStudent(studentId)
    return HttpResponse.json(assignments)
  }),

  // GET /assignments/:id — 과제 상세
  http.get('/assignments/:id', ({ params, request }) => {
    const { id } = params as { id: string }
    const auth = request.headers.get('Authorization') ?? ''
    const studentId = auth.replace('Bearer mock-jwt-token-', '') || '20240001'

    // 수강 중인 강의의 과제인지 확인
    const myAssignments = getAssignmentsForStudent(studentId)
    const assignment = myAssignments.find((a) => a.id === id)
      ?? allAssignments.find((a) => a.id === id) // fallback

    if (!assignment) {
      return HttpResponse.json({ message: '과제를 찾을 수 없습니다' }, { status: 404 })
    }

    const submitted = loadSubmitted()
    const submittedAt = submitted[id] ?? null

    return HttpResponse.json({
      ...assignment,
      isSubmitted: !!submittedAt,
      submittedAt: submittedAt ?? undefined,
    })
  }),

  // POST /assignments/:id/submit — 과제 제출
  http.post('/assignments/:id/submit', ({ params }) => {
    const { id } = params as { id: string }

    const submitted = loadSubmitted()
    submitted[id] = new Date().toISOString()
    saveSubmitted(submitted)

    return new HttpResponse(null, { status: 201 })
  }),
]
