import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../features/dashboard/hooks/useDashboard'
import SkeletonCard from '../shared/components/SkeletonCard'

const THUMBNAIL_COLORS = [
  { bg: 'bg-indigo-50', icon: 'text-indigo-300' },
  { bg: 'bg-blue-50',   icon: 'text-blue-300' },
  { bg: 'bg-purple-50', icon: 'text-purple-300' },
  { bg: 'bg-teal-50',   icon: 'text-teal-300' },
  { bg: 'bg-rose-50',   icon: 'text-rose-300' },
  { bg: 'bg-amber-50',  icon: 'text-amber-300' },
]

const CoursesPage = () => {
  const { data, isLoading, isError } = useDashboard()
  const navigate = useNavigate()

  if (isError) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-gray-500">강의 목록을 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-screen-2xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">강의 목록</h1>
        <p className="mt-1 text-sm text-gray-500">현재 학기 수강 중인 강의입니다.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : data?.courses.length === 0 ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl shadow-sm">
          <p className="text-gray-400">수강 중인 강의가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.courses.map((course, index) => {
            const color = THUMBNAIL_COLORS[index % 6]
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => navigate(`/courses/${course.id}/lectures`)}
                className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-full h-28 rounded-lg ${color.bg} flex items-center justify-center`}>
                  <span className={`text-3xl ${color.icon}`}>📚</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{course.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{course.professorName}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">진도율</span>
                    <span className="text-xs font-semibold text-blue-500">{course.progressRate}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${course.progressRate}%` }}
                    />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CoursesPage
