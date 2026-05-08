import { useRef, useEffect } from 'react'
import { useChat } from '../hooks/useChat'
import { formatChatTime } from '../../../shared/utils/formatDate'
import useAuthStore from '../../../store/authStore'

interface ChatPanelProps {
  courseId: string
}

export default function ChatPanel({ courseId }: ChatPanelProps) {
  const { messages, isLoading, connectionError, isSending, form, onSubmit } =
    useChat(courseId)
  const { user } = useAuthStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 새 메시지 도착 시 하단으로 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 키로 전송, Shift+Enter는 줄바꿈
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  const contentValue = form.watch('content')
  const charCount = contentValue?.length ?? 0

  return (
    <div className="flex flex-col h-full bg-[#1a1a2e] text-white">
      {/* 연결 끊김 경고 배너 */}
      {connectionError && (
        <div
          className="flex items-center gap-2 px-3 py-2 bg-yellow-600/90 text-yellow-100 text-xs flex-shrink-0"
          role="alert"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
          {connectionError}
        </div>
      )}

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center h-16 text-gray-500 text-sm">
            메시지를 불러오는 중...
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-16 text-gray-500 text-sm">
            아직 채팅 메시지가 없습니다.
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.authorName === user?.name
          return (
            <div key={msg.id} className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <span
                  className={[
                    'text-xs font-bold',
                    isMe ? 'text-red-400' : 'text-blue-400',
                  ].join(' ')}
                >
                  {msg.authorName}
                </span>
                <span className="text-gray-500 text-[10px]">
                  {formatChatTime(msg.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed break-words whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
          )
        })}

        {/* 자동 스크롤 앵커 */}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="flex-shrink-0 border-t border-gray-700 p-3">
        <form onSubmit={onSubmit} noValidate>
          {/* 유효성 오류 메시지 */}
          {form.formState.errors.content && (
            <p className="text-red-400 text-xs mb-1.5" role="alert">
              {form.formState.errors.content.message}
            </p>
          )}

          <div className="flex gap-2 items-end">
            <div className="flex-1 flex flex-col">
              <textarea
                {...form.register('content')}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력하세요 (Enter 전송, Shift+Enter 줄바꿈)"
                rows={2}
                maxLength={500}
                aria-label="채팅 메시지 입력"
                className="w-full bg-gray-800 text-white text-sm rounded px-3 py-2 resize-none placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 border border-gray-700"
              />
              {/* 글자 수 표시 */}
              <span
                className={[
                  'text-right text-[10px] mt-0.5',
                  charCount > 450 ? 'text-red-400' : 'text-gray-500',
                ].join(' ')}
              >
                {charCount} / 500
              </span>
            </div>

            <button
              type="submit"
              disabled={isSending || charCount === 0}
              aria-label="메시지 전송"
              className="mb-4 px-3 py-2 bg-[#ef4444] hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors flex-shrink-0"
            >
              {isSending ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                '전송'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
