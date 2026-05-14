import { useDashboard } from '../features/dashboard/hooks/useDashboard'
import SkeletonCard from '../shared/components/SkeletonCard'

// 출석률에 따른 색상 구간
function getAttendanceColor(rate: number): { bar: string; text: string; border: string } {
  if (rate >= 90) return { bar: 'bg-blue-500',   text: 'text-blue-600',  border: 'border-t-blue-400' }
  if (rate >= 75) return { bar: 'bg-indigo-400', text: 'text-indigo-600', border: 'border-t-indigo-400' }
  if (rate >= 60) return { bar: 'bg-amber-400',  text: 'text-amber-600', border: 'border-t-amber-400' }
  return               { bar: 'bg-red-400',    text: 'text-red-600',   border: 'border-t-red-400' }
}

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
  const overallRate = attendance?.rate ?? 0
  const overallColor = getAttendanceColor(overallRate)

  return (
    <div className="p-6 flex flex-col gap-6 max-w-3xl mx-auto w-full">
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
          <div className={`bg-white rounded-xl shadow-sm p-6 border-t-4 ${overallColor.border}`}>
            <p className="text-sm text-gray-500 font-medium mb-2">전체 출석률</p>
            <div className="flex items-end gap-3">
              <span className={`text-5xl font-bold ${overallColor.text}`}>
                {overallRate.toFixed(1)}%
              </span>
              <span className="text-gray-400 text-sm mb-1">
                ({attendance?.attendedCount} / {attendance?.totalCount}강의)
              </span>
            </div>

            {/* 출석률 상태 메시지 */}
            <p className={`mt-2 text-sm font-medium ${overallColor.text}`}>
              {overallRate >= 90 && '✅ 우수한 출석률입니다'}
              {overallRate >= 75 && overallRate < 90 && '📌 양호한 출석률입니다'}
              {overallRate >= 60 && overallRate < 75 && '⚠️ 출석률 주의 — 75% 미만입니다'}
              {overallRate < 60 && '🚨 출석률 위험 — 60% 미만입니다'}
            </p>

            {/* 프로그레스 바 */}
            <div className="mt-4 w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${overallColor.bar}`}
                style={{ width: `${overallRate}%` }}
              />
            </div>

            {/* 구간 레이블 */}
            <div className="flex justify-between mt-1 text-[10px] text-gray-400">
              <span>0%</span>
              <span className="text-red-400">60%</span>
              <span className="text-amber-400">75%</span>
              <span className="text-indigo-400">90%</span>
              <span>100%</span>
            </div>
          </div>

          {/* 강의별 출석 현황 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">강의별 출석 현황</h2>
            <div className="flex flex-col gap-4">
              {data?.courses.map((course) => {
                const courseRate = (course as typeof course & { attendanceRate?: number }).attendanceRate ?? 0
                const color = getAttendanceColor(courseRate)
                return (
                  <div key={course.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="min-w-0 flex-1 mr-4">
                        <p className="text-sm font-medium text-gray-700 truncate">{course.title}</p>
                        <p className="text-xs text-gray-400">{course.professorName}</p>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ${color.text}`}>
                        {courseRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${color.bar}`}
                        style={{ width: `${courseRate}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 출석률 기준 안내 */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">출석률 기준</p>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />90% 이상 — 우수</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-400 inline-block" />75~89% — 양호</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />60~74% — 주의</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" />60% 미만 — 위험</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AttendancePage
