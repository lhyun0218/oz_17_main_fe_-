import { useRef, useCallback } from 'react'
import { recordAttendance } from '../api/lectureApi'

interface UseAttendanceOptions {
  lectureId: string
  duration: number // 전체 재생 시간 (초)
}

export function useAttendance({ lectureId, duration }: UseAttendanceOptions) {
  const hasRecorded = useRef(false)

  /**
   * 현재 재생 시간을 전달하여 출석 기록 여부를 판단한다.
   * 80% 이상 시청 시 recordAttendance API를 정확히 1회 호출한다.
   */
  const progress = useCallback(
    (currentTime: number) => {
      if (hasRecorded.current) return
      if (duration <= 0) return

      const ratio = currentTime / duration
      if (ratio >= 0.8) {
        hasRecorded.current = true
        recordAttendance(lectureId).catch(() => {
          // 출석 기록 실패 시 재시도 가능하도록 플래그 초기화
          hasRecorded.current = false
        })
      }
    },
    [lectureId, duration]
  )

  /**
   * 강의가 변경될 때 출석 기록 상태를 초기화한다.
   */
  const reset = useCallback(() => {
    hasRecorded.current = false
  }, [])

  return { progress, reset }
}
