import type { CourseOutline as CourseOutlineType, LectureItem } from '../types'
import { formatDuration } from '../../../shared/utils/formatDuration'

interface CourseOutlineProps {
  outline: CourseOutlineType
  activeLectureId: string | null
  onSelectLecture: (lecture: LectureItem) => void
}

export default function CourseOutline({
  outline,
  activeLectureId,
  onSelectLecture,
}: CourseOutlineProps) {
  return (
    <div className="flex flex-col gap-2 overflow-y-auto">
      <h2 className="text-sm font-semibold text-gray-300 px-3 pt-2 pb-1">{outline.title}</h2>

      {outline.weeks.map((week) => (
        <div key={week.weekNumber}>
          {/* 주차 헤더 */}
          <div className="px-3 py-2 bg-gray-800/60 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {week.title}
          </div>

          {/* 강의 목록 */}
          <ul>
            {week.lectures.map((lecture) => {
              const isActive = lecture.id === activeLectureId
              return (
                <li key={lecture.id}>
                  <button
                    onClick={() => onSelectLecture(lecture)}
                    className={[
                      'w-full text-left px-3 py-2.5 flex items-start gap-2 transition-colors',
                      isActive
                        ? 'bg-red-600/20 border-l-2 border-red-500 text-white'
                        : 'hover:bg-gray-700/50 text-gray-300 border-l-2 border-transparent',
                    ].join(' ')}
                    aria-current={isActive ? 'true' : undefined}
                    aria-label={`${lecture.title}, ${formatDuration(lecture.durationSeconds)}${lecture.isCompleted ? ', 완료' : ''}`}
                  >
                    {/* 완료 여부 아이콘 */}
                    <span
                      className={[
                        'mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs',
                        lecture.isCompleted
                          ? 'bg-green-500 text-white'
                          : 'border border-gray-500 text-transparent',
                      ].join(' ')}
                      aria-hidden="true"
                    >
                      ✓
                    </span>

                    {/* 강의 정보 */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={[
                          'text-xs leading-snug truncate',
                          isActive ? 'font-semibold text-white' : 'text-gray-300',
                        ].join(' ')}
                      >
                        {lecture.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDuration(lecture.durationSeconds)}
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
