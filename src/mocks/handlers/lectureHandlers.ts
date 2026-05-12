import { http, HttpResponse } from 'msw'
import { mockCourseOutlines, mockChatMessagesByCourse } from '../fixtures/lectures'
import type { ChatMessage } from '../../features/lecture/types'

// localStorage 키
const CHAT_STORAGE_KEY = 'mock-db-chat-messages'

// localStorage에서 채팅 스토어 읽기 (없으면 초기 데이터 사용)
function getChatStore(): Record<string, ChatMessage[]> {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as Record<string, ChatMessage[]>
    }
  } catch {
    // localStorage 접근 실패 시 인메모리 폴백
  }
  // 초기 데이터로 초기화
  const initial: Record<string, ChatMessage[]> = {}
  Object.entries(mockChatMessagesByCourse).forEach(([courseId, messages]) => {
    initial[courseId] = [...messages]
  })
  return initial
}

// localStorage에 채팅 스토어 저장
function saveChatStore(store: Record<string, ChatMessage[]>): void {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(store))
  } catch {
    // localStorage 쓰기 실패 시 무시 (인메모리 상태 유지)
  }
}

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

  // GET /chat/:courseId/messages — 강의별 채팅 반환 (createdAt 오름차순 정렬)
  http.get('/chat/:courseId/messages', ({ params }) => {
    const courseId = params.courseId as string
    const store = getChatStore()
    const messages = (store[courseId] ?? []).slice().sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    return HttpResponse.json(messages)
  }),

  // POST /chat/:courseId/messages — 강의별 채팅 전송
  http.post('/chat/:courseId/messages', async ({ request, params }) => {
    const courseId = params.courseId as string
    const body = await request.json() as {
      content: string
      authorName?: string
      isProfessor?: boolean
    }

    const newMessage: ChatMessage = {
      id: `${courseId}-m${Date.now()}`,
      authorName: body.authorName ?? '이현규',
      content: body.content,
      createdAt: new Date().toISOString(),
      isProfessor: body.isProfessor ?? false,
    }

    const store = getChatStore()
    if (!store[courseId]) {
      store[courseId] = []
    }
    store[courseId] = [...store[courseId], newMessage]
    saveChatStore(store)

    return HttpResponse.json(newMessage, { status: 201 })
  }),
]
