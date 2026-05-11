import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../lib/axios'

interface CourseAvailable {
  courseId: string
  title: string
  professorName: string
  credits: number
  semester: string
  department: string
  maxStudents: number
  enrolledCount: number
  isEnrolled: boolean
  isFull: boolean
}

async function fetchAvailableCourses(): Promise<CourseAvailable[]> {
  const res = await apiClient.get<CourseAvailable[]>('/enrollment/available')
  return res.data
}

async function enrollCourse(courseId: string): Promise<void> {
  await apiClient.post('/enrollment', { courseId })
}

async function cancelEnrollment(courseId: string): Promise<void> {
  await apiClient.delete(`/enrollment/${courseId}`)
}

const DEPARTMENTS = ['전체', '컴퓨터소프트웨어공학과', '간호학과']

const EnrollmentPage = () => {
  const queryClient = useQueryClient()
  const [selectedDept, setSelectedDept] = useState('전체')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data: courses = [], isLoading, isError } = useQuery({
    queryKey: ['enrollment/available'],
    queryFn: fetchAvailableCourses,
  })

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const enrollMutation = useMutation({
    mutationFn: enrollCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment/available'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      showToast('수강신청이 완료되었습니다', 'success')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      showToast(error.response?.data?.message ?? '수강신청에 실패했습니다', 'error')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: cancelEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment/available'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      showToast('수강취소가 완료되었습니다', 'success')
    },
    onError: () => {
      showToast('수강취소에 실패했습니다', 'error')
    },
  })

  const filtered = courses.filter((c) => {
    const matchDept = selectedDept === '전체' || c.department === selectedDept
    const matchSearch = c.title.includes(search) || c.professorName.includes(search)
    return matchDept && matchSearch
  })

  const enrolled = filtered.filter((c) => c.isEnrolled)
  const available = filtered.filter((c) => !c.isEnrolled)

  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl mx-auto">
      {/* 토스트 */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">수강신청</h1>
        <p className="mt-1 text-sm text-gray-500">원하는 강의를 검색하고 수강신청하세요.</p>
      </div>

      {/* 필터 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedDept === dept
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="강의명 또는 교수명 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {isError && (
        <p className="text-center text-red-500 text-sm">강의 목록을 불러올 수 없습니다.</p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl shadow-sm p-5 h-36" />
          ))}
        </div>
      ) : (
        <>
          {/* 수강 중인 강의 */}
          {enrolled.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 mb-3">
                수강 중 ({enrolled.length}개)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {enrolled.map((course) => (
                  <CourseCard
                    key={course.courseId}
                    course={course}
                    onCancel={() => cancelMutation.mutate(course.courseId)}
                    isPending={cancelMutation.isPending}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 신청 가능한 강의 */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 mb-3">
              신청 가능 ({available.length}개)
            </h2>
            {available.length === 0 ? (
              <div className="flex items-center justify-center py-16 bg-white rounded-xl shadow-sm">
                <p className="text-gray-400 text-sm">신청 가능한 강의가 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {available.map((course) => (
                  <CourseCard
                    key={course.courseId}
                    course={course}
                    onEnroll={() => enrollMutation.mutate(course.courseId)}
                    isPending={enrollMutation.isPending}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

interface CourseCardProps {
  course: CourseAvailable
  onEnroll?: () => void
  onCancel?: () => void
  isPending: boolean
}

function CourseCard({ course, onEnroll, onCancel, isPending }: CourseCardProps) {
  const deptColor = course.department === '간호학과'
    ? 'bg-pink-50 text-pink-600'
    : 'bg-blue-50 text-blue-600'

  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3 border-l-4 ${
      course.isEnrolled ? 'border-l-green-400' : course.isFull ? 'border-l-gray-300' : 'border-l-blue-400'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">{course.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{course.professorName}</p>
        </div>
        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${deptColor}`}>
          {course.department === '간호학과' ? '간호' : '컴공'}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>학점 {course.credits}</span>
        <span>·</span>
        <span>{course.semester}</span>
        <span>·</span>
        <span className={course.isFull ? 'text-red-500 font-medium' : ''}>
          {course.enrolledCount}/{course.maxStudents}명
        </span>
      </div>

      {/* 정원 바 */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            course.isFull ? 'bg-red-400' : 'bg-blue-400'
          }`}
          style={{ width: `${Math.min(100, (course.enrolledCount / course.maxStudents) * 100)}%` }}
        />
      </div>

      {course.isEnrolled ? (
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="w-full rounded-lg border border-red-300 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          수강취소
        </button>
      ) : (
        <button
          type="button"
          onClick={onEnroll}
          disabled={isPending || course.isFull}
          className="w-full rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {course.isFull ? '정원 초과' : '수강신청'}
        </button>
      )}
    </div>
  )
}

export default EnrollmentPage
