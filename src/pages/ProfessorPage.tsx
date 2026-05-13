import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useProfessorStore from '../store/professorStore'
import type { ChatMessage } from '../features/lecture/types'
import type { CourseRecord } from '../mocks/fixtures/db'
import { getCourseDB } from '../mocks/fixtures/db'
import { formatChatTime } from '../shared/utils/formatDate'

const POLL_INTERVAL = 3000

interface StudentChannel {
  studentId: string
  name: string
  messageCount: number
  lastMessage: string | null
  lastAt: string | null
}

export default function ProfessorPage() {
  const navigate = useNavigate()
  const { professorName, professorLogout } = useProfessorStore()

  const [courses, setCourses] = useState<CourseRecord[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)

  // 학생 채널 목록
  const [students, setStudents] = useState<StudentChannel[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)

  const [answer, setAnswer] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 담당 강의 목록 — getCourseDB() 직접 사용
  useEffect(() => {
    let name = professorName
    if (!name) {
      try {
        const raw = localStorage.getItem('professor-storage')
        if (raw) {
          const parsed = JSON.parse(raw)
          name = parsed?.state?.professorName ?? null
        }
      } catch { /* ignore */ }
    }
    if (!name) { setCoursesLoading(false); return }
    setCoursesLoading(true)
    const myCourses = getCourseDB().filter((c) => c.professorName === name)
    setCourses(myCourses)
    setCoursesLoading(false)
  }, [professorName])

  // 강의 선택 시 학생 채널 목록 로드
  const fetchStudents = useCallback(async (courseId: string) => {
    try {
      const res = await fetch(`/chat/${courseId}/students`)
      if (res.ok) {
        const data = await res.json()
        setStudents(data)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (!selectedCourseId) { setStudents([]); setSelectedStudentId(null); return }
    fetchStudents(selectedCourseId)
    // 3초마다 학생 목록 갱신 (새 메시지 알림)
    const timer = setInterval(() => fetchStudents(selectedCourseId), POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [selectedCourseId, fetchStudents])

  // 학생 채널 메시지 조회
  const fetchMessages = useCallback(async (courseId: string, studentId: string) => {
    try {
      const res = await fetch(`/chat/${courseId}/student/${studentId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null }
    if (!selectedCourseId || !selectedStudentId) { setMessages([]); return }

    setMessagesLoading(true)
    fetchMessages(selectedCourseId, selectedStudentId).finally(() => setMessagesLoading(false))

    pollTimerRef.current = setInterval(() => {
      fetchMessages(selectedCourseId, selectedStudentId)
    }, POLL_INTERVAL)

    return () => { if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null } }
  }, [selectedCourseId, selectedStudentId, fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourseId || !selectedStudentId || !answer.trim() || answer.length > 500) return

    setSendError('')
    setIsSending(true)
    try {
      const res = await fetch(`/chat/${selectedCourseId}/student/${selectedStudentId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: answer, authorName: professorName }),
      })
      if (res.ok) {
        setAnswer('')
        await fetchMessages(selectedCourseId, selectedStudentId)
        await fetchStudents(selectedCourseId)
      } else {
        setSendError('메시지 전송에 실패했습니다.')
      }
    } catch {
      setSendError('서버에 연결할 수 없습니다.')
    } finally {
      setIsSending(false)
    }
  }

  const selectedCourse = courses.find((c) => c.courseId === selectedCourseId)
  const selectedStudent = students.find((s) => s.studentId === selectedStudentId)

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
        <button type="button" onClick={() => { professorLogout(); navigate('/admin/login') }}
          className="px-4 py-1.5 text-sm rounded-md bg-gray-700 hover:bg-gray-600 transition text-gray-200">
          로그아웃
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 좌측 1: 담당 강의 목록 */}
        <aside className="w-52 flex-shrink-0 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-700">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">담당 강의</h2>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {coursesLoading ? (
              <p className="px-4 py-3 text-sm text-gray-500">불러오는 중...</p>
            ) : courses.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-500">담당 강의가 없습니다.</p>
            ) : courses.map((course) => (
              <button key={course.courseId} type="button"
                onClick={() => { setSelectedCourseId(course.courseId); setSelectedStudentId(null) }}
                className={['w-full text-left px-4 py-3 text-sm transition-colors',
                  selectedCourseId === course.courseId
                    ? 'bg-yellow-600/20 text-yellow-300 border-l-2 border-yellow-500'
                    : 'text-gray-300 hover:bg-gray-700'].join(' ')}>
                <div className="font-medium truncate">{course.title}</div>
                <div className="text-xs text-gray-500 mt-0.5 truncate">{course.department}</div>
              </button>
            ))}
          </div>
        </aside>

        {/* 좌측 2: 학생 채널 목록 */}
        <aside className="w-52 flex-shrink-0 bg-gray-850 border-r border-gray-700 flex flex-col bg-[#1a1f2e]">
          <div className="px-4 py-3 border-b border-gray-700">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {selectedCourseId ? `${selectedCourse?.title ?? ''} 학생` : '학생 채널'}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {!selectedCourseId ? (
              <p className="px-4 py-3 text-xs text-gray-500">강의를 먼저 선택하세요.</p>
            ) : students.length === 0 ? (
              <p className="px-4 py-3 text-xs text-gray-500">수강 학생이 없습니다.</p>
            ) : students.map((s) => (
              <button key={s.studentId} type="button"
                onClick={() => setSelectedStudentId(s.studentId)}
                className={['w-full text-left px-4 py-3 text-sm transition-colors',
                  selectedStudentId === s.studentId
                    ? 'bg-blue-600/20 text-blue-300 border-l-2 border-blue-500'
                    : 'text-gray-300 hover:bg-gray-700'].join(' ')}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{s.name}</span>
                  {s.messageCount > 0 && (
                    <span className="text-[10px] bg-blue-500/30 text-blue-400 px-1.5 py-0.5 rounded-full">
                      {s.messageCount}
                    </span>
                  )}
                </div>
                {s.lastMessage && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{s.lastMessage}</p>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* 우측: 채팅 패널 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {!selectedStudentId ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              {selectedCourseId ? '학생을 선택하세요.' : '강의를 선택하세요.'}
            </div>
          ) : (
            <>
              <div className="px-6 py-3 bg-gray-800 border-b border-gray-700">
                <h2 className="text-sm font-semibold">
                  {selectedCourse?.title} — {selectedStudent?.name} 학생 채팅
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {messagesLoading ? (
                  <p className="text-sm text-gray-500">메시지를 불러오는 중...</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-gray-500">아직 채팅 메시지가 없습니다.</p>
                ) : messages.map((msg) => (
                  <div key={msg.id}
                    className={['flex flex-col gap-0.5',
                      msg.isProfessor ? 'bg-yellow-900/20 border-l-2 border-yellow-500/50 pl-2 rounded' : ''].join(' ')}>
                    <div className="flex items-baseline gap-2">
                      <span className={['text-xs font-bold',
                        msg.isProfessor ? 'text-yellow-400' : 'text-blue-400'].join(' ')}>
                        {msg.authorName}
                      </span>
                      {msg.isProfessor && (
                        <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1 rounded">교수</span>
                      )}
                      <span className="text-gray-500 text-[10px]">{formatChatTime(msg.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed break-words whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex-shrink-0 border-t border-gray-700 px-6 py-4 bg-gray-800">
                {sendError && <p className="text-red-400 text-xs mb-2" role="alert">{sendError}</p>}
                <form onSubmit={handleSend} className="flex gap-3 items-end">
                  <div className="flex-1 flex flex-col">
                    <textarea value={answer} onChange={(e) => setAnswer(e.target.value)}
                      placeholder={`${selectedStudent?.name} 학생에게 답변을 입력하세요...`}
                      rows={3} maxLength={500} aria-label="교수 답변 입력"
                      className="w-full bg-gray-700 text-white text-sm rounded px-3 py-2 resize-none placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 border border-gray-600" />
                    <span className={['text-right text-[10px] mt-0.5',
                      answer.length > 450 ? 'text-red-400' : 'text-gray-500'].join(' ')}>
                      {answer.length} / 500
                    </span>
                  </div>
                  <button type="submit"
                    disabled={isSending || answer.trim().length === 0 || answer.length > 500}
                    className="mb-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors flex-shrink-0">
                    {isSending
                      ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : '전송'}
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
