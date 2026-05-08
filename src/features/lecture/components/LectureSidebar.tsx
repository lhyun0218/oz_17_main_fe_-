import { useState } from 'react'
import type { CourseOutline as CourseOutlineType, LectureItem } from '../types'
import CourseOutline from './CourseOutline'
import ChatPanel from './ChatPanel'

type Tab = 'outline' | 'chat'

interface LectureSidebarProps {
  outline: CourseOutlineType | undefined
  activeLectureId: string | null
  onSelectLecture: (lecture: LectureItem) => void
  courseId: string
}

export default function LectureSidebar({
  outline,
  activeLectureId,
  onSelectLecture,
  courseId,
}: LectureSidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('outline')

  return (
    <div className="flex flex-col h-full bg-[#1a1a2e] text-white">
      {/* 탭바 */}
      <div className="flex border-b border-gray-700 flex-shrink-0">
        <button
          onClick={() => setActiveTab('outline')}
          className={[
            'flex-1 py-3 text-sm font-medium transition-colors',
            activeTab === 'outline'
              ? 'text-white border-b-2 border-red-500'
              : 'text-gray-400 hover:text-gray-200',
          ].join(' ')}
          aria-selected={activeTab === 'outline'}
          role="tab"
        >
          목차
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={[
            'flex-1 py-3 text-sm font-medium transition-colors',
            activeTab === 'chat'
              ? 'text-white border-b-2 border-red-500'
              : 'text-gray-400 hover:text-gray-200',
          ].join(' ')}
          aria-selected={activeTab === 'chat'}
          role="tab"
        >
          채팅
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'outline' ? (
          outline ? (
            <CourseOutline
              outline={outline}
              activeLectureId={activeLectureId}
              onSelectLecture={onSelectLecture}
            />
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
              강의 목차를 불러오는 중...
            </div>
          )
        ) : (
          /* 채팅 탭 — ChatPanel 컴포넌트 */
          <ChatPanel courseId={courseId} />
        )}
      </div>
    </div>
  )
}
