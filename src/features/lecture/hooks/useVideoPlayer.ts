import { useRef, useState, useCallback, useEffect } from 'react'

interface UseVideoPlayerOptions {
  onEnded?: () => void
}

export function useVideoPlayer({ onEnded: onEndedCallback }: UseVideoPlayerOptions = {}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(1)
  const [playbackRate, setPlaybackRateState] = useState(1)
  const [isBuffering, setIsBuffering] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasError, setHasError] = useState(false)

  // 전체화면 변경 감지
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }, [])

  const seek = useCallback((time: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = time
    setCurrentTime(time)
  }, [])

  const setVolume = useCallback((value: number) => {
    const video = videoRef.current
    if (!video) return
    const clamped = Math.max(0, Math.min(1, value))
    video.volume = clamped
    setVolumeState(clamped)
  }, [])

  const setPlaybackRate = useCallback((rate: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = rate
    setPlaybackRateState(rate)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (!document.fullscreenElement) {
      video.requestFullscreen().catch(() => {
        // 전체화면 요청 실패 시 무시
      })
    } else {
      document.exitFullscreen()
    }
  }, [])

  // 이벤트 핸들러
  const onTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    setCurrentTime(video.currentTime)
  }, [])

  const onLoadedMetadata = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    setDuration(video.duration)
    setHasError(false)
  }, [])

  const onWaiting = useCallback(() => {
    setIsBuffering(true)
  }, [])

  const onCanPlay = useCallback(() => {
    setIsBuffering(false)
  }, [])

  const onError = useCallback(() => {
    setHasError(true)
    setIsBuffering(false)
    setIsPlaying(false)
  }, [])

  const onPlay = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const onPause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const onEnded = useCallback(() => {
    setIsPlaying(false)
    onEndedCallback?.()
  }, [onEndedCallback])

  return {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isBuffering,
    isFullscreen,
    hasError,
    togglePlay,
    seek,
    setVolume,
    setPlaybackRate,
    toggleFullscreen,
    // 이벤트 핸들러 (video 엘리먼트에 직접 바인딩)
    handlers: {
      onTimeUpdate,
      onLoadedMetadata,
      onWaiting,
      onCanPlay,
      onError,
      onPlay,
      onPause,
      onEnded,
    },
  }
}
