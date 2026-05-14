import { useDashboard } from '../features/dashboard/hooks/useDashboard'
import StatCard from '../features/dashboard/components/StatCard'
import AttendanceGauge from '../features/dashboard/components/AttendanceGauge'
import WeeklyChart from '../features/dashboard/components/WeeklyChart'
import CourseCard from '../features/dashboard/components/CourseCard'
import AssignmentList from '../features/dashboard/components/AssignmentList'
import SkeletonCard from '../shared/components/SkeletonCard'
import useAuthStore from '../store/authStore'
import { getWeeklyStudyData } from '../shared/utils/studyTracker'
import { studentDB } from '../mocks/fixtures/db'

const DashboardPage = () => {
  const { data, isLoading, isError } = useDashboard()
  const { user } = useAuthStore()

  const studentId = user?.studentId ?? ''
  // 실제 학습 데이터 (localStorage 기반)
  const weeklyStudy = getWeeklyStudyData(studentId)

  // 학생 상세 정보 (DB에서 직접 조회)
  const studentInfo = studentDB.find((s) => s.studentId === studentId)

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  if (isError) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <p className="text-gray-500">데이터를 불러올 수 없습니다</p>
      </div>
    )
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-screen-2xl mx-auto w-full">
      {/* 페이지 헤더 — 학생 정보 카드 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">통합 대시보드</h1>
          <p className="text-sm text-gray-400 mt-0.5">{today}</p>
        </div>
        {/* 학생 정보 배지 */}
        {studentInfo && (
          <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm px-5 py-3 border-l-4 border-[#1e1b4b]">
            <div className="w-10 h-10 rounded-full bg-[#ef4444] flex items-center justify-center text-white font-bold text-sm shrink-0">
              {studentInfo.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{studentInfo.name}</p>
              <p className="text-xs text-gray-500">{studentInfo.studentId} · {studentInfo.grade}학년</p>
              <p className="text-xs text-gray-400">{studentInfo.department}</p>
            </div>
          </div>
        )}
      </div>

      {/* 통계 카드 행 */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="수강 강의"
            value={data?.courses.length ?? 0}
            subtitle="수강 중인 강의 수"
            borderColor="blue"
          />
          <StatCard
            title="미제출 과제"
            value={data?.assignments.filter((a) => !a.isSubmitted).length ?? 0}
            subtitle="제출 대기 중인 과제"
            borderColor="yellow"
          />
          <StatCard
            title="출석 강의"
            value={data?.attendance.attendedCount ?? 0}
            subtitle={`전체 ${data?.attendance.totalCount ?? 0}강의`}
            borderColor="green"
          />
          {data?.attendance ? (
            <AttendanceGauge
              rate={data.attendance.rate}
              attendedCount={data.attendance.attendedCount}
              totalCount={data.attendance.totalCount}
            />
          ) : (
            <StatCard title="출석률" value="—" borderColor="red" />
          )}
        </div>
      )}

      {/* 중간 행: 주간 학습 차트 + 미제출 과제 */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <SkeletonCard className="h-64" />
          </div>
          <div className="lg:col-span-2">
            <SkeletonCard className="h-64" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <WeeklyChart data={weeklyStudy} />
          </div>
          <div className="lg:col-span-2">
            <AssignmentList assignments={data?.assignments ?? []} />
          </div>
        </div>
      )}

      {/* 하단: 수강 중인 강의 그리드 */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-4">수강 중인 강의</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : data?.courses.length === 0 ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-sm text-gray-400">수강 중인 강의가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
