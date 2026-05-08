import { http, HttpResponse } from 'msw'
import { mockCourseOutlines, mockChatMessagesByCourse } from '../fixtures/lectures'

// 채팅 메시지 인메모리 저장소 (courseId별로 구분)
const chatStore: Record<string, Array<{ id: string; authorName: string; content: string; createdAt: string }>> = {}

// 초기 데이터 복사
Object.entries(mockChatMessagesByCourse).forEach(([courseId, messages]) => {
  chatStore[courseId] = [...messages]
})

export const lectureHandlers = [
  // GET /courses/:courseId/outline — 강의별 목차 반환
  http.get('/courses/:courseId/outline', ({ params }) => {
    const courseId = params.courseId as string
    const outline = mockCourseOutlines[courseId]

    if (outline) {
      return HttpResponse.json(outline)
    }

    // 등록되지 않은 강의는 빈 목차 반환
    return HttpResponse.json({
      courseId,
      title: '강의',
      weeks: [],
    })
  }),

  // POST /lectures/:lectureId/attendance
  http.post('/lectures/:lectureId/attendance', () => {
    return new HttpResponse(null, { status: 200 })
  }),

  // GET /chat/:courseId/messages — 강의별 채팅 반환
  http.get('/chat/:courseId/messages', ({ params }) => {
    const courseId = params.courseId as string
    const messages = chatStore[courseId] ?? []
    return HttpResponse.json(messages)
  }),

  // POST /chat/:courseId/messages — 강의별 채팅 전송
  http.post('/chat/:courseId/messages', async ({ request, params }) => {
    const courseId = params.courseId as string
    const body = await request.json() as { content: string; authorName?: string }

    const newMessage = {
      id: `${courseId}-m${Date.now()}`,
      authorName: body.authorName ?? '이현규',
      content: body.content,
      createdAt: new Date().toISOString(),
    }

    if (!chatStore[courseId]) {
      chatStore[courseId] = []
    }
    chatStore[courseId] = [...chatStore[courseId], newMessage]

    return HttpResponse.json(newMessage, { status: 201 })
  }),
]
