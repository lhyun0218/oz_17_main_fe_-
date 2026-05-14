import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCourseOutline } from '../features/lecture/api/lectureApi'
import type { LectureItem } from '../features/lecture/types'
import VideoPlayer from '../features/lecture/components/VideoPlayer'
import LectureSidebar from '../features/lecture/components/LectureSidebar'

export default function LecturePage() {
  const { courseId = '', lectureId } = useParams<{ courseId: string; lectureId?: string }>()
  const [showSidebar, setShowSidebar] = useState(false)

  const { data: outline, isLoading, isError } = useQuery({
    queryKey: ['courses', courseId, 'outline'],
    queryFn: () => getCourseOutline(courseId),
    enabled: !!courseId,
  })

  const [activeLecture, setActiveLecture] = useState<LectureItem | null>(null)

  useEffect(() => {
    if (!outline) return
    if (lectureId) {
      const allLectures = outline.weeks.flatMap((w) => w.lectures)
      const found = allLectures.find((l) => l.id === lectureId)
      if (found) { setActiveLecture(found); return }
    }
    const allLectures = outline.weeks.flatMap((w) => w.lectures)
    const firstUnwatched = allLectures.find((l) => !l.isCompleted) ?? allLectures[0]
    if (firstUnwatched) setActiveLecture(firstUnwatched)
  }, [outline, lectureId])

  const handleVideoEnded = () => {
    if (!outline || !activeLecture) return
    const allLectures = outline.weeks.flatMap((w) => w.lectures)
    const currentIndex = allLectures.findIndex((l) => l.id === activeLecture.id)
    const nextLecture = allLectures[currentIndex + 1]
    if (nextLecture) setActiveLecture(nextLecture)
  }

  const handleSelectLecture = (lecture: LectureItem) => {
    setActiveLecture(lecture)
    setShowSidebar(false) // 모바일에서 강의 선택 시 사이드바 닫기
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-black text-white">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center bg-black text-white">
        <p>강의 정보를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-black overflow-hidden">
      {/* 모바일 상단 바 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 lg:hidden flex-shrink-0">
        <div className="min-w-0 flex-1 mr-3">
          <p className="text-white text-sm font-semibold truncate">
            {activeLecture?.title ?? '강의 선택'}
          </p>
          {outline && <p className="text-gray-400 text-xs truncate">{outline.title}</p>}
        </div>
        <button
          onClick={() => setShowSidebar((v) => !v)}
          className="shrink-0 flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded-md transition"
          aria-label="목차/채팅 열기"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          목차
        </button>
      </div>

      {/* 메인 영역 */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* 비디오 영역 */}
        <div className={`flex flex-col bg-black min-w-0 transition-all duration-300 ${showSidebar ? 'hidden lg:flex lg:flex-1' : 'flex flex-1'}`}>
          {activeLecture ? (
            <>
              <VideoPlayer
                key={activeLecture.id}
                videoUrl={activeLecture.videoUrl}
                lectureId={activeLecture.id}
                onEnded={handleVideoEnded}
              />
              {/* 데스크탑 강의 제목 */}
              <div className="hidden lg:block px-4 py-3 bg-gray-900 flex-shrink-0">
                <h1 className="text-white text-base font-semibold truncate">{activeLecture.title}</h1>
                {outline && <p className="text-gray-400 text-sm mt-0.5">{outline.title}</p>}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              강의를 선택해 주세요.
            </div>
          )}
        </div>

        {/* 사이드바 — 모바일: 전체화면 오버레이, 데스크탑: 우측 고정 */}
        <div className={[
          'bg-[#1a1a2e] flex-shrink-0 border-l border-gray-700',
          // 데스크탑: 항상 표시, 너비 고정
          'lg:w-80 xl:w-96 lg:flex lg:flex-col',
          // 모바일: 토글
          showSidebar
            ? 'flex flex-col w-full absolute inset-0 z-20'
            : 'hidden',
        ].join(' ')}>
          {/* 모바일 닫기 버튼 */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 lg:hidden flex-shrink-0">
            <span className="text-white text-sm font-medium">목차 / 채팅</span>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-gray-400 hover:text-white p-1"
              aria-label="닫기"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <LectureSidebar
              outline={outline}
              activeLectureId={activeLecture?.id ?? null}
              onSelectLecture={handleSelectLecture}
              courseId={courseId}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
