interface SkeletonCardProps {
  className?: string
}

const SkeletonCard = ({ className = '' }: SkeletonCardProps) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-white p-5 shadow-sm ${className}`}
      aria-hidden="true"
      role="presentation"
    >
      {/* 상단 헤더 영역 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>

      {/* 본문 영역 */}
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-4/6" />
      </div>

      {/* 하단 영역 */}
      <div className="mt-4 h-2 bg-gray-200 rounded-full w-full" />
    </div>
  )
}

export default SkeletonCard
