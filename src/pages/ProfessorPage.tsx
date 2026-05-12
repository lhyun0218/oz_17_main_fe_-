import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useProfessorStore from '../store/professorStore'
import type { ChatMessage } from '../features/lecture/types'
import type { CourseRecord } from '../mocks/fixtures/db'
import { formatChatTime } from '../shared/utils/formatDate'

const POLL_INTERVAL = 3000

export default function ProfessorPage() {
  const navigate = useNavigate()
  const { professorName, professorToken, professorLogout } = useProfessorStore()

  const [courses, setCourses] = useState<CourseRecord[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)

  const [answer, setAnswer] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 담당 강의 목록 조회
  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true)
      try {
        const res = await fetch('/professor/courses', {
          headers: { Authorization: `Bearer ${professorToken}` },
        })
        if (res.ok) {
          const data = await res.json()
          setCourses(data)
        } else if (res.status === 401) {
          professorLogout()
          navigate('/admin/login')
        }
      } catch {
        // 네트워크 오류 무시
      } finally {
        setCoursesLoading(false)
      }
    }
    fetchCourses()
  }, [professorToken, professorLogout, navigate])

  // 채팅 메시지 조회
  const fetchMessages = useCallback(async (courseId: string) => {
    try {
      const res = await fetch(`/chat/${courseId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch {
      // 네트워크 오류 무시
    }
  }, [])

  // 강의 선택 시 메시지 로드 + 폴링 시작
  useEffect(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }

    if (!selectedCourseId) {
      setMessages([])
      return
    }

    setMessagesLoading(true)
    fetchMessages(selectedCourseId).finally(() => setMessagesLoading(false))

    pollTimerRef.current = setInterval(() => {
      fetchMessages(selectedCourseId)
    }, POLL_INTERVAL)

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
        pollTimerRef.current = null
      }
    }
  }, [selectedCourseId, fetchMessages])

  // 새 메시지 도착 시 하단 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourseId || !answer.trim() || answer.length > 500) return

    setSendError('')
    setIsSending(true)
    try {
      const res = await fetch(`/chat/${selectedCourseId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: answer,
          authorName: professorName,
          isProfessor: true,
        }),
      })
      if (res.ok) {
        setAnswer('')
        await fetchMessages(selectedCourseId)
      } else {
        setSendError('메시지 전송에 실패했습니다.')
      }
    } catch {
      setSendError('서버에 연결할 수 없습니다.')
    } finally {
      setIsSending(false)
    }
  }

  const handleLogout = () => {
    professorLogout()
    navigate('/admin/login')
  }

  const selectedCourse = courses.find((c) => c.courseId === selectedCourseId)

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎓</span>
          <div>
            <h1 className="text-base font-bold">현규대학교 LMS — 교수 포털</h1>
            <p className="text-xs text-yellow-400">{professorName} 교수님</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-1.5 text-sm rounded-md bg-gray-700 hover:bg-gray-600 transition text-gray-200"
        >
          로그아웃
        </button>
      </header>

      {/* 본문 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측: 담당 강의 목록 */}
        <aside className="w-64 flex-shrink-0 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-700">
            <h2 className="text-sm font-semibold text-gray-300">담당 강의</h2>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {coursesLoading ? (
              <p className="px-4 py-3 text-sm text-gray-500">불러오는 중...</p>
            ) : courses.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-500">담당 강의가 없습니다.</p>
            ) : (
              courses.map((course) => (
                <button
                  key={course.courseId}
                  type="button"
                  onClick={() => setSelectedCourseId(course.courseId)}
                  className={[
                    'w-full text-left px-4 py-3 text-sm transition-colors',
                    selectedCourseId === course.courseId
                      ? 'bg-yellow-600/20 text-yellow-300 border-l-2 border-yellow-500'
                      : 'text-gray-300 hover:bg-gray-700',
                  ].join(' ')}
                >
                  <div className="font-medium">{course.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{course.department}</div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* 우측: 채팅 Q&A 패널 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {!selectedCourseId ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              좌측에서 강의를 선택하세요.
            </div>
          ) : (
            <>
              {/* 채팅 헤더 */}
              <div className="px-6 py-3 bg-gray-800 border-b border-gray-700">
                <h2 className="text-sm font-semibold">
                  {selectedCourse?.title ?? selectedCourseId} — 채팅 Q&A
                </h2>
              </div>

              {/* 메시지 목록 */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {messagesLoading ? (
                  <p className="text-sm text-gray-500">메시지를 불러오는 중...</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-gray-500">아직 채팅 메시지가 없습니다.</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={[
                        'flex flex-col gap-0.5',
                        msg.isProfessor
                          ? 'bg-yellow-900/20 border-l-2 border-yellow-500/50 pl-2 rounded'
                          : '',
                      ].join(' ')}
                    >
                      <div className="flex items-baseline gap-2">
                        <span
                          className={[
                            'text-xs font-bold',
                            msg.isProfessor ? 'text-yellow-400' : 'text-blue-400',
                          ].join(' ')}
                        >
                          {msg.authorName}
                        </span>
                        {msg.isProfessor && (
                          <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1 rounded">
                            교수
                          </span>
                        )}
                        <span className="text-gray-500 text-[10px]">
                          {formatChatTime(msg.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200 leading-relaxed break-words whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 답변 입력 폼 */}
              <div className="flex-shrink-0 border-t border-gray-700 px-6 py-4 bg-gray-800">
                {sendError && (
                  <p className="text-red-400 text-xs mb-2" role="alert">{sendError}</p>
                )}
                <form onSubmit={handleSend} className="flex gap-3 items-end">
                  <div className="flex-1 flex flex-col">
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="학생 질문에 답변을 입력하세요..."
                      rows={3}
                      maxLength={500}
                      aria-label="교수 답변 입력"
                      className="w-full bg-gray-700 text-white text-sm rounded px-3 py-2 resize-none placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 border border-gray-600"
                    />
                    <span
                      className={[
                        'text-right text-[10px] mt-0.5',
                        answer.length > 450 ? 'text-red-400' : 'text-gray-500',
                      ].join(' ')}
                    >
                      {answer.length} / 500
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={isSending || answer.trim().length === 0 || answer.length > 500}
                    aria-label="답변 전송"
                    className="mb-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors flex-shrink-0"
                  >
                    {isSending ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : '전송'}
                  </button>
                </form>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
