import { useNavigate } from 'react-router-dom'
import type { CourseCard as CourseCardType } from '../types'

interface CourseCardProps {
  course: CourseCardType
}

const CourseCard = ({ course }: CourseCardProps) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/courses/${course.id}/lectures`)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3 text-left hover:shadow-md transition-shadow w-full cursor-pointer"
      aria-label={`${course.title} 강의 페이지로 이동`}
    >
      {/* 썸네일 */}
      <div className="w-full h-28 rounded-lg bg-indigo-50 flex items-center justify-center overflow-hidden">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={`${course.title} 썸네일`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl text-indigo-300">📚</span>
        )}
      </div>

      {/* 강의 정보 */}
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">
          {course.title}
        </p>
        <p className="text-xs text-gray-400">{course.professorName}</p>
      </div>

      {/* 진도율 */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">진도율</span>
          <span className="text-xs font-semibold text-blue-500">{course.progressRate}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${course.progressRate}%` }}
            role="progressbar"
            aria-valuenow={course.progressRate}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`진도율 ${course.progressRate}%`}
          />
        </div>
      </div>
    </button>
  )
}

export default CourseCard
