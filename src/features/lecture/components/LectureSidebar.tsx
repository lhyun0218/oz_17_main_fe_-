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
    <div className="flex flex-col h-full min-h-0 bg-[#1a1a2e] text-white">
      {/* 탭바 */}
      <div className="flex border-b border-gray-700 flex-shrink-0">
        {(['outline', 'chat'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              'flex-1 py-3 text-sm font-medium transition-colors',
              activeTab === tab
                ? 'text-white border-b-2 border-red-500'
                : 'text-gray-400 hover:text-gray-200',
            ].join(' ')}
            aria-selected={activeTab === tab}
            role="tab"
          >
            {tab === 'outline' ? '목차' : '채팅'}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 — flex-1 + min-h-0 으로 높이 확보 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'outline' ? (
          <div className="h-full overflow-y-auto">
            {outline ? (
              <CourseOutline
                outline={outline}
                activeLectureId={activeLectureId}
                onSelectLecture={onSelectLecture}
              />
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                강의 목차를 불러오는 중...
              </div>
            )}
          </div>
        ) : (
          /* 채팅 탭 — h-full로 ChatPanel이 전체 높이 차지 */
          <div className="h-full flex flex-col">
            <ChatPanel courseId={courseId} />
          </div>
        )}
      </div>
    </div>
  )
}
