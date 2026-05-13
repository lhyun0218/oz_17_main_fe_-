import { http, HttpResponse } from 'msw'
import { mockCourseOutlines, mockChatMessagesByCourse } from '../fixtures/lectures'
import { getEnrollmentDB, getStudentDB } from '../fixtures/db'
import type { ChatMessage } from '../../features/lecture/types'

// localStorage 키
const CHAT_STORAGE_KEY = 'mock-db-chat-messages'

// 채팅 스토어 키 형식:
// - 학생 채널: `{courseId}__student__{studentId}` (학생별 1:1 채널)
// - 강의 전체: `{courseId}` (하위 호환용)

function getChatStore(): Record<string, ChatMessage[]> {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Record<string, ChatMessage[]>
  } catch { /* ignore */ }
  // 초기 데이터
  const initial: Record<string, ChatMessage[]> = {}
  Object.entries(mockChatMessagesByCourse).forEach(([courseId, messages]) => {
    initial[courseId] = [...messages]
  })
  return initial
}

function saveChatStore(store: Record<string, ChatMessage[]>): void {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(store))
  } catch { /* ignore */ }
}

export const lectureHandlers = [
  // GET /courses/:courseId/outline
  http.get('/courses/:courseId/outline', ({ params }) => {
    const courseId = params.courseId as string
    const outline = mockCourseOutlines[courseId]
    if (outline) return HttpResponse.json(outline)
    return HttpResponse.json({ courseId, title: '강의', weeks: [] })
  }),

  // POST /lectures/:lectureId/attendance
  http.post('/lectures/:lectureId/attendance', () => {
    return new HttpResponse(null, { status: 200 })
  }),

  // GET /chat/:courseId/messages — 학생용: 자신의 채널만 반환
  // Authorization 헤더에서 studentId 추출
  http.get('/chat/:courseId/messages', ({ params, request }) => {
    const courseId = params.courseId as string
    const auth = request.headers.get('Authorization') ?? ''
    const store = getChatStore()

    // 학생 토큰에서 studentId 추출
    const studentId = auth.replace('Bearer mock-jwt-token-', '')

    if (studentId && studentId !== auth) {
      // 학생 전용 채널 키
      const channelKey = `${courseId}__student__${studentId}`
      const messages = (store[channelKey] ?? []).slice().sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      return HttpResponse.json(messages)
    }

    // 인증 없으면 강의 전체 채널 반환 (하위 호환)
    const messages = (store[courseId] ?? []).slice().sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    return HttpResponse.json(messages)
  }),

  // POST /chat/:courseId/messages — 학생용: 자신의 채널에 저장
  http.post('/chat/:courseId/messages', async ({ request, params }) => {
    const courseId = params.courseId as string
    const auth = request.headers.get('Authorization') ?? ''
    const body = await request.json() as {
      content: string
      authorName?: string
      isProfessor?: boolean
      studentId?: string
    }

    // 채널 키 결정
    let channelKey = courseId
    const tokenStudentId = auth.replace('Bearer mock-jwt-token-', '')
    if (tokenStudentId && tokenStudentId !== auth && !body.isProfessor) {
      channelKey = `${courseId}__student__${tokenStudentId}`
    } else if (body.studentId && !body.isProfessor) {
      channelKey = `${courseId}__student__${body.studentId}`
    }

    const newMessage: ChatMessage = {
      id: `${channelKey}-m${Date.now()}`,
      authorName: body.authorName ?? '학생',
      content: body.content,
      createdAt: new Date().toISOString(),
      isProfessor: body.isProfessor ?? false,
    }

    const store = getChatStore()
    if (!store[channelKey]) store[channelKey] = []
    store[channelKey] = [...store[channelKey], newMessage]
    saveChatStore(store)

    return HttpResponse.json(newMessage, { status: 201 })
  }),

  // GET /chat/:courseId/students — 교수용: 해당 강의 수강 학생 목록 + 채널 여부
  http.get('/chat/:courseId/students', ({ params }) => {
    const courseId = params.courseId as string
    const enrollments = getEnrollmentDB().filter((e) => e.courseId === courseId)
    const students = getStudentDB()
    const store = getChatStore()

    const result = enrollments.map((e) => {
      const student = students.find((s) => s.studentId === e.studentId)
      const channelKey = `${courseId}__student__${e.studentId}`
      const messages = store[channelKey] ?? []
      return {
        studentId: e.studentId,
        name: student?.name ?? e.studentId,
        messageCount: messages.length,
        lastMessage: messages.length > 0 ? messages[messages.length - 1].content : null,
        lastAt: messages.length > 0 ? messages[messages.length - 1].createdAt : null,
      }
    })

    return HttpResponse.json(result)
  }),

  // GET /chat/:courseId/student/:studentId/messages — 교수용: 특정 학생 채널 조회
  http.get('/chat/:courseId/student/:studentId/messages', ({ params }) => {
    const { courseId, studentId } = params as { courseId: string; studentId: string }
    const channelKey = `${courseId}__student__${studentId}`
    const store = getChatStore()
    const messages = (store[channelKey] ?? []).slice().sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    return HttpResponse.json(messages)
  }),

  // POST /chat/:courseId/student/:studentId/messages — 교수용: 특정 학생 채널에 답변
  http.post('/chat/:courseId/student/:studentId/messages', async ({ request, params }) => {
    const { courseId, studentId } = params as { courseId: string; studentId: string }
    const body = await request.json() as { content: string; authorName?: string }

    const channelKey = `${courseId}__student__${studentId}`
    const newMessage: ChatMessage = {
      id: `${channelKey}-m${Date.now()}`,
      authorName: body.authorName ?? '교수',
      content: body.content,
      createdAt: new Date().toISOString(),
      isProfessor: true,
    }

    const store = getChatStore()
    if (!store[channelKey]) store[channelKey] = []
    store[channelKey] = [...store[channelKey], newMessage]
    saveChatStore(store)

    return HttpResponse.json(newMessage, { status: 201 })
  }),
]
