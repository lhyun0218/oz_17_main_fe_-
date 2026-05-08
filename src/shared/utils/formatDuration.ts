/**
 * 초(seconds)를 "분:초" 형식으로 변환한다.
 * 예: 1800 → "30:00", 90 → "1:30", 3661 → "61:01"
 */
export function formatDuration(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${minutes}:${String(secs).padStart(2, '0')}`
}
