import { useDashboard } from '../features/dashboard/hooks/useDashboard'
import SkeletonCard from '../shared/components/SkeletonCard'

const AttendancePage = () => {
  const { data, isLoading, isError } = useDashboard()

  if (isError) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-gray-500">출석 현황을 불러올 수 없습니다.</p>
      </div>
    )
  }

  const attendance = data?.attendance
  const isWarning = (attendance?.rate ?? 100) < 75

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">출석 현황</h1>
        <p className="mt-1 text-sm text-gray-500">현재 학기 전체 출석 현황입니다.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {/* 전체 출석률 카드 */}
          <div className={`bg-white rounded-xl shadow-sm p-6 border-t-4 ${isWarning ? 'border-t-red-400' : 'border-t-green-400'}`}>
            <p className="text-sm text-gray-500 font-medium mb-2">전체 출석률</p>
            <div className="flex items-end gap-3">
              <span className={`text-5xl font-bold ${isWarning ? 'text-red-500' : 'text-green-500'}`}>
                {attendance?.rate.toFixed(1)}%
              </span>
              <span className="text-gray-400 text-sm mb-1">
                ({attendance?.attendedCount} / {attendance?.totalCount}강의)
              </span>
            </div>
            {isWarning && (
              <p className="mt-2 text-sm font-semibold text-red-500">⚠️ 출석률 주의 — 75% 미만입니다</p>
            )}
            {/* 프로그레스 바 */}
            <div className="mt-4 w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isWarning ? 'bg-red-400' : 'bg-green-400'}`}
                style={{ width: `${attendance?.rate ?? 0}%` }}
              />
            </div>
          </div>

          {/* 강의별 출석 현황 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">강의별 출석 현황</h2>
            <div className="flex flex-col gap-3">
              {data?.courses.map((course) => {
                // DB의 실제 강의별 출석률 사용
                const courseRate = (course as typeof course & { attendanceRate?: number }).attendanceRate ?? 0
                const warn = courseRate < 75
                return (
                  <div key={course.id} className="flex items-center gap-4">
                    <div className="w-32 shrink-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{course.title}</p>
                      <p className="text-xs text-gray-400">{course.professorName}</p>
                    </div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${warn ? 'bg-red-400' : 'bg-green-400'}`}
                        style={{ width: `${courseRate}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold w-12 text-right ${warn ? 'text-red-500' : 'text-green-500'}`}>
                      {courseRate.toFixed(1)}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AttendancePage
