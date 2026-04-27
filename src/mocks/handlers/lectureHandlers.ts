import { http, HttpResponse } from 'msw'
import { mockCourseOutline, mockChatMessages } from '../fixtures/lectures'

// 채팅 메시지 인메모리 저장소 (핸들러 간 공유)
let chatMessages = [...mockChatMessages]

export const lectureHandlers = [
  // GET /courses/:courseId/outline
  http.get('/courses/:courseId/outline', ({ params }) => {
    const { courseId } = params

    // cs101 이외의 강의는 기본 목차 구조 반환
    if (courseId === mockCourseOutline.courseId) {
      return HttpResponse.json(mockCourseOutline)
    }

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

  // GET /chat/:courseId/messages
  http.get('/chat/:courseId/messages', () => {
    return HttpResponse.json(chatMessages)
  }),

  // POST /chat/:courseId/messages
  http.post('/chat/:courseId/messages', async ({ request }) => {
    const body = await request.json() as { content: string; authorName?: string }
    const newMessage = {
      id: `m${Date.now()}`,
      authorName: body.authorName ?? '이현규',
      content: body.content,
      createdAt: new Date().toISOString(),
    }
    chatMessages = [...chatMessages, newMessage]

    return HttpResponse.json(newMessage, { status: 201 })
  }),
]
