import { useNavigate } from 'react-router-dom'
import type { AssignmentItem } from '../types'

interface AssignmentListProps {
  assignments: AssignmentItem[]
}

const AssignmentList = ({ assignments }: AssignmentListProps) => {
  const navigate = useNavigate()

  // 미제출 과제만 필터링 후 마감일 오름차순 정렬
  const unsubmitted = assignments
    .filter((a) => !a.isSubmitted)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const now = Date.now()

  const getDueBadge = (dueDate: string) => {
    const due = new Date(dueDate).getTime()
    const diff = due - now

    if (diff < 0) {
      // 마감됨
      return { label: '마감', className: 'bg-gray-200 text-gray-500' }
    }
    if (diff <= 24 * 60 * 60 * 1000) {
      // 24시간 이내
      const hoursLeft = Math.floor(diff / (60 * 60 * 1000))
      return {
        label: hoursLeft <= 0 ? 'D-0' : '마감 임박',
        className: 'bg-red-100 text-red-600',
      }
    }
    const daysLeft = Math.ceil(diff / (24 * 60 * 60 * 1000))
    return { label: `D-${daysLeft}`, className: 'bg-blue-50 text-blue-500' }
  }

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate)
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isExpired = (dueDate: string) => new Date(dueDate).getTime() < now

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 h-full flex flex-col">
      <h2 className="text-base font-semibold text-gray-700 mb-4">미제출 과제</h2>

      {unsubmitted.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">제출할 과제가 없습니다</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2 overflow-y-auto">
          {unsubmitted.map((assignment) => {
            const badge = getDueBadge(assignment.dueDate)
            const expired = isExpired(assignment.dueDate)

            return (
              <li key={assignment.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/assignments/${assignment.id}`)}
                  className={`w-full text-left rounded-lg border px-4 py-3 flex items-start justify-between gap-3 hover:bg-gray-50 transition-colors ${
                    expired ? 'border-gray-100 opacity-60' : 'border-gray-100'
                  }`}
                  aria-label={`${assignment.title} 과제 페이지로 이동`}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        expired ? 'text-gray-400' : 'text-gray-700'
                      }`}
                    >
                      {assignment.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{assignment.courseName}</p>
                    <p className="text-xs text-gray-400">{formatDueDate(assignment.dueDate)}</p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default AssignmentList
