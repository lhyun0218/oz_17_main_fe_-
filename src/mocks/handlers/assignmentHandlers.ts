import { http, HttpResponse } from 'msw'
import { mockAssignments } from '../fixtures/assignments'

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

export const assignmentHandlers = [
  // GET /assignments/:id
  http.get('/assignments/:id', ({ params }) => {
    const { id } = params as { id: string }
    const assignment = mockAssignments.find((a) => a.id === id)

    if (!assignment) {
      return HttpResponse.json(
        { message: '과제를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const submitted = loadSubmitted()
    const submittedAt = submitted[id] ?? null
    const isSubmitted = !!submittedAt

    return HttpResponse.json({
      ...assignment,
      isSubmitted,
      description: `${assignment.title}에 대한 상세 설명입니다. 요구사항에 맞게 과제를 제출해 주세요.`,
      submittedAt: submittedAt ?? undefined,
    })
  }),

  // POST /assignments/:id/submit
  http.post('/assignments/:id/submit', ({ params }) => {
    const { id } = params as { id: string }

    const submitted = loadSubmitted()
    submitted[id] = new Date().toISOString()
    saveSubmitted(submitted)

    // mockAssignments 메모리도 동기화
    const assignment = mockAssignments.find((a) => a.id === id)
    if (assignment) {
      assignment.isSubmitted = true
    }

    return new HttpResponse(null, { status: 201 })
  }),
]
