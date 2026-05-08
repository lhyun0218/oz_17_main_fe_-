import { useEffect } from 'react'
import { useVideoPlayer } from '../hooks/useVideoPlayer'
import { useAttendance } from '../hooks/useAttendance'
import { formatDuration } from '../../../shared/utils/formatDuration'
import { startStudySession, endStudySession } from '../../../shared/utils/studyTracker'
import useAuthStore from '../../../store/authStore'

const PLAYBACK_RATES = [0.5, 1, 1.25, 1.5, 2]

interface VideoPlayerProps {
  videoUrl: string
  lectureId: string
  onEnded?: () => void
}

export default function VideoPlayer({ videoUrl, lectureId, onEnded }: VideoPlayerProps) {
  const { user } = useAuthStore()
  const studentId = user?.studentId ?? '20240001'

  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isBuffering,
    hasError,
    togglePlay,
    seek,
    setVolume,
    setPlaybackRate,
    toggleFullscreen,
    handlers,
  } = useVideoPlayer({ onEnded })

  const { progress, reset } = useAttendance({ lectureId, duration })

  // 강의 변경 시 세션 종료 + 출석 초기화
  useEffect(() => {
    return () => {
      endStudySession(studentId)
    }
  }, [lectureId, studentId])

  useEffect(() => {
    reset()
  }, [lectureId, reset])

  // 재생 시작 → 학습 세션 시작
  const handlePlay = () => {
    handlers.onPlay()
    startStudySession(studentId, lectureId)
  }

  // 일시정지/종료 → 학습 세션 종료 (시간 누적)
  const handlePause = () => {
    handlers.onPause()
    endStudySession(studentId)
  }

  const handleEnded = () => {
    handlers.onEnded()
    endStudySession(studentId)
  }

  // 재생 시간 업데이트 시 출석 진행률 갱신
  const handleTimeUpdate = () => {
    handlers.onTimeUpdate()
    progress(videoRef.current?.currentTime ?? 0)
  }

  // 페이지 언마운트 시 세션 종료
  useEffect(() => {
    return () => { endStudySession(studentId) }
  }, [studentId])

  return (
    <div className="relative w-full bg-black flex flex-col" style={{ aspectRatio: '16/9' }}>
      {/* 비디오 엘리먼트 */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handlers.onLoadedMetadata}
        onWaiting={handlers.onWaiting}
        onCanPlay={handlers.onCanPlay}
        onError={handlers.onError}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        aria-label="강의 동영상"
      />

      {/* 버퍼링 스피너 */}
      {isBuffering && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div
            className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"
            role="status"
            aria-label="동영상 로딩 중"
          />
        </div>
      )}

      {/* 오류 메시지 */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <p className="text-white text-center px-4">
            동영상을 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.
          </p>
        </div>
      )}

      {/* 컨트롤바 */}
      {!hasError && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-4 py-2 flex flex-col gap-1">
          {/* SeekBar */}
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-1 accent-red-500 cursor-pointer"
            aria-label="재생 위치"
          />

          {/* 하단 컨트롤 */}
          <div className="flex items-center gap-3 text-white text-sm">
            {/* 재생/일시정지 버튼 */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-red-400 transition-colors text-lg leading-none"
              aria-label={isPlaying ? '일시정지' : '재생'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            {/* 시간 표시 */}
            <span className="tabular-nums text-xs whitespace-nowrap">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>

            {/* 볼륨 슬라이더 */}
            <div className="flex items-center gap-1">
              <span className="text-xs">🔊</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-16 h-1 accent-red-500 cursor-pointer"
                aria-label="볼륨"
              />
            </div>

            {/* 재생 속도 선택 */}
            <select
              value={playbackRate}
              onChange={(e) => setPlaybackRate(Number(e.target.value))}
              className="bg-transparent text-white text-xs border border-white/30 rounded px-1 py-0.5 cursor-pointer"
              aria-label="재생 속도"
            >
              {PLAYBACK_RATES.map((rate) => (
                <option key={rate} value={rate} className="bg-black text-white">
                  {rate}x
                </option>
              ))}
            </select>

            {/* 전체화면 버튼 */}
            <button
              onClick={toggleFullscreen}
              className="ml-auto text-white hover:text-red-400 transition-colors text-sm"
              aria-label="전체화면"
            >
              ⛶
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
