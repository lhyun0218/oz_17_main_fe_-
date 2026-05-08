/**
 * ISO 8601 문자열을 채팅 표시용 시각으로 변환한다.
 * - 오늘 날짜이면 "HH:MM" 형식
 * - 다른 날짜이면 "MM/DD HH:MM" 형식
 */
export function formatChatTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()

  const pad = (n: number) => String(n).padStart(2, '0')
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  if (isToday) {
    return `${hours}:${minutes}`
  }

  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  return `${month}/${day} ${hours}:${minutes}`
}
