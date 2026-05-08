import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { getAssignment } from '../features/assignment/api/assignmentApi'
import AssignmentSubmitForm from '../features/assignment/components/AssignmentSubmitForm'

/**
 * 마감일을 사람이 읽기 쉬운 형식으로 변환한다.
 */
function formatDueDate(isoString: string): string {
  const date = new Date(isoString)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * 마감 임박 여부를 확인한다 (24시간 이내).
 */
function isDeadlineSoon(dueDate: string): boolean {
  const diff = new Date(dueDate).getTime() - Date.now()
  return diff > 0 && diff < 24 * 60 * 60 * 1000
}

/**
 * 마감 여부를 확인한다.
 */
function isExpired(dueDate: string): boolean {
  return new Date(dueDate) < new Date()
}

/**
 * 과제 페이지 스켈레톤 UI
 */
function AssignmentSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden="true" role="presentation">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded-md bg-gray-200" />
        <div className="space-y-2">
          <div className="h-6 w-64 rounded bg-gray-200" />
          <div className="h-4 w-40 rounded bg-gray-200" />
        </div>
      </div>
      {/* 마감일 */}
      <div className="h-5 w-48 rounded bg-gray-200" />
      {/* 설명 카드 */}
      <div className="rounded-xl bg-white p-6 shadow-sm space-y-3">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-5/6 rounded bg-gray-200" />
        <div className="h-4 w-4/6 rounded bg-gray-200" />
      </div>
      {/* 제출 폼 */}
      <div className="rounded-xl bg-white p-6 shadow-sm space-y-4">
        <div className="h-32 w-full rounded-lg bg-gray-200" />
        <div className="h-24 w-full rounded-lg bg-gray-200" />
        <div className="h-10 w-full rounded-lg bg-gray-200" />
      </div>
    </div>
  )
}

const AssignmentPage = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>()
  const navigate = useNavigate()

  const {
    data: assignment,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () => getAssignment(assignmentId!),
    enabled: !!assignmentId,
  })

  if (isLoading) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <AssignmentSkeleton />
      </div>
    )
  }

  // 404 처리
  const is404 =
    isError &&
    (error as { response?: { status?: number } })?.response?.status === 404

  if (is404 || (!isLoading && !assignment)) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-lg font-medium text-gray-700">과제를 찾을 수 없습니다</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          뒤로 가기
        </button>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-lg font-medium text-red-600">오류가 발생했습니다</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          뒤로 가기
        </button>
      </div>
    )
  }

  if (!assignment) return null

  const expired = isExpired(assignment.dueDate)
  const soon = isDeadlineSoon(assignment.dueDate)

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      {/* 헤더: 뒤로가기 + 과제명 + 강의명 */}
      <div className="flex items-start gap-4">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => navigate(-1)}
          className="mt-1 rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
          <p className="mt-1 text-sm text-gray-500">{assignment.courseName}</p>
        </div>
      </div>

      {/* 마감일 표시 */}
      <div className="flex items-center gap-2">
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span
          className={[
            'text-sm font-medium',
            expired ? 'text-red-600' : soon ? 'text-red-500' : 'text-gray-600',
          ].join(' ')}
        >
          마감일: {formatDueDate(assignment.dueDate)}
          {expired && ' (마감됨)'}
          {!expired && soon && ' (마감 임박)'}
        </span>
      </div>

      {/* 과제 설명 카드 */}
      <section
        aria-labelledby="assignment-description-heading"
        className="rounded-xl bg-white p-6 shadow-sm"
      >
        <h2
          id="assignment-description-heading"
          className="mb-3 text-base font-semibold text-gray-800"
        >
          과제 설명
        </h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
          {assignment.description}
        </p>
      </section>

      {/* 과제 제출 폼 */}
      <section
        aria-labelledby="assignment-submit-heading"
        className="rounded-xl bg-white p-6 shadow-sm"
      >
        <h2
          id="assignment-submit-heading"
          className="mb-4 text-base font-semibold text-gray-800"
        >
          과제 제출
        </h2>
        <AssignmentSubmitForm
          assignmentId={assignment.id}
          dueDate={assignment.dueDate}
          isSubmitted={assignment.isSubmitted}
        />
      </section>
    </div>
  )
}

export default AssignmentPage
