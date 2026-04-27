import { http, HttpResponse } from 'msw'
import { mockAssignments } from '../fixtures/assignments'

export const assignmentHandlers = [
  // GET /assignments/:id
  http.get('/assignments/:id', ({ params }) => {
    const { id } = params
    const assignment = mockAssignments.find((a) => a.id === id)

    if (!assignment) {
      return HttpResponse.json(
        { message: '과제를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      ...assignment,
      description: `${assignment.title}에 대한 상세 설명입니다. 요구사항에 맞게 과제를 제출해 주세요.`,
      submittedAt: assignment.isSubmitted ? new Date().toISOString() : undefined,
    })
  }),

  // POST /assignments/:id/submit
  http.post('/assignments/:id/submit', () => {
    return new HttpResponse(null, { status: 201 })
  }),
]
