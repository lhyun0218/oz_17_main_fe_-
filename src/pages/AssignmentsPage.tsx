import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import apiClient from '../lib/axios'

interface AssignmentItem {
  id: string
  title: string
  courseName: string
  dueDate: string
  isSubmitted: boolean
  submittedAt?: string
}

async function fetchAssignments(): Promise<AssignmentItem[]> {
  const res = await apiClient.get<AssignmentItem[]>('/assignments')
  return res.data
}

function formatDueDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function getDueBadge(dueDate: string, isSubmitted: boolean) {
  if (isSubmitted) return { label: '제출완료', className: 'bg-green-100 text-green-600' }
  const diff = new Date(dueDate).getTime() - Date.now()
  if (diff < 0) return { label: '마감', className: 'bg-gray-200 text-gray-500' }
  if (diff <= 24 * 60 * 60 * 1000) return { label: '마감임박', className: 'bg-red-100 text-red-600' }
  const days = Math.ceil(diff / (24 * 60 * 60 * 1000))
  return { label: `D-${days}`, className: 'bg-blue-50 text-blue-500' }
}

const FILTERS = ['전체', '미제출', '제출완료', '마감'] as const
type Filter = typeof FILTERS[number]

const AssignmentsPage = () => {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<Filter>('전체')

  const { data: assignments = [], isLoading, isError } = useQuery({
    queryKey: ['assignments'],
    queryFn: fetchAssignments,
  })

  const now = Date.now()

  const filtered = assignments.filter((a) => {
    const expired = new Date(a.dueDate).getTime() < now
    if (activeFilter === '미제출') return !a.isSubmitted && !expired
    if (activeFilter === '제출완료') return a.isSubmitted
    if (activeFilter === '마감') return expired && !a.isSubmitted
    return true
  })

  const submittedCount = assignments.filter((a) => a.isSubmitted).length
  const pendingCount = assignments.filter((a) => !a.isSubmitted && new Date(a.dueDate).getTime() >= now).length
  const expiredCount = assignments.filter((a) => !a.isSubmitted && new Date(a.dueDate).getTime() < now).length

  return (
    <div className="p-6 flex flex-col gap-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">과제 현황</h1>
        <p className="mt-1 text-sm text-gray-500">수강 중인 강의의 전체 과제 목록입니다.</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border-t-4 border-blue-400">
          <p className="text-2xl font-bold text-blue-500">{pendingCount}</p>
          <p className="text-xs text-gray-500 mt-1">미제출</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border-t-4 border-green-400">
          <p className="text-2xl font-bold text-green-500">{submittedCount}</p>
          <p className="text-xs text-gray-500 mt-1">제출완료</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border-t-4 border-gray-300">
          <p className="text-2xl font-bold text-gray-400">{expiredCount}</p>
          <p className="text-xs text-gray-500 mt-1">마감</p>
        </div>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeFilter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isError && (
        <p className="text-center text-red-500 text-sm">과제 목록을 불러올 수 없습니다.</p>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl shadow-sm h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl shadow-sm">
          <p className="text-gray-400 text-sm">해당하는 과제가 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {[...filtered]
            .sort((a, b) => {
              if (a.isSubmitted !== b.isSubmitted) return a.isSubmitted ? 1 : -1
              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            })
            .map((assignment) => {
              const badge = getDueBadge(assignment.dueDate, assignment.isSubmitted)
              const isExpiredItem = new Date(assignment.dueDate).getTime() < now && !assignment.isSubmitted

              return (
                <button
                  key={assignment.id}
                  type="button"
                  onClick={() => navigate(`/assignments/${assignment.id}`)}
                  className={`w-full text-left bg-white rounded-xl shadow-sm px-5 py-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow border-l-4 ${
                    assignment.isSubmitted
                      ? 'border-l-green-400'
                      : isExpiredItem
                      ? 'border-l-gray-300 opacity-60'
                      : 'border-l-blue-400'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isExpiredItem ? 'text-gray-400' : 'text-gray-800'}`}>
                      {assignment.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{assignment.courseName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      마감: {formatDueDate(assignment.dueDate)}
                      {assignment.isSubmitted && assignment.submittedAt && (
                        <span className="ml-2 text-green-500">
                          · 제출: {formatDueDate(assignment.submittedAt)}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${badge.className}`}>
                    {badge.label}
                  </span>
                </button>
              )
            })}
        </div>
      )}
    </div>
  )
}

export default AssignmentsPage
