/**
 * 학습 시간 추적기 (localStorage 기반)
 *
 * 구조:
 * - study-log-{studentId}: { [date: YYYY-MM-DD]: minutes }
 * - study-session-{studentId}: { courseId, startedAt: ISO, date: YYYY-MM-DD }
 *
 * 동작 방식:
 * - 강의 재생 시작 → startSession() 호출
 * - 강의 일시정지/종료 → endSession() 호출 → 오늘 날짜에 분 누적
 * - 하루가 지나면 전날 데이터는 확정되어 변경 불가
 * - 최근 7일 데이터만 반환
 */

const LOG_KEY = (studentId: string) => `study-log-${studentId}`
const SESSION_KEY = (studentId: string) => `study-session-${studentId}`

interface StudyLog {
  [date: string]: number  // YYYY-MM-DD → 분
}

interface StudySession {
  courseId: string
  startedAt: string  // ISO
  date: string       // YYYY-MM-DD
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function getLog(studentId: string): StudyLog {
  try {
    const raw = localStorage.getItem(LOG_KEY(studentId))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLog(studentId: string, log: StudyLog): void {
  localStorage.setItem(LOG_KEY(studentId), JSON.stringify(log))
}

/** 강의 재생 시작 */
export function startStudySession(studentId: string, courseId: string): void {
  const session: StudySession = {
    courseId,
    startedAt: new Date().toISOString(),
    date: getToday(),
  }
  localStorage.setItem(SESSION_KEY(studentId), JSON.stringify(session))
}

/** 강의 일시정지/종료 — 경과 시간을 오늘 날짜에 누적 */
export function endStudySession(studentId: string): void {
  try {
    const raw = localStorage.getItem(SESSION_KEY(studentId))
    if (!raw) return

    const session: StudySession = JSON.parse(raw)
    const now = new Date()
    const started = new Date(session.startedAt)
    const elapsedMinutes = Math.floor((now.getTime() - started.getTime()) / 60000)

    if (elapsedMinutes <= 0) {
      localStorage.removeItem(SESSION_KEY(studentId))
      return
    }

    const today = getToday()
    const log = getLog(studentId)

    // 세션이 시작된 날짜에 누적 (자정을 넘어도 시작 날짜 기준)
    const targetDate = session.date
    log[targetDate] = (log[targetDate] ?? 0) + elapsedMinutes

    saveLog(studentId, log)
    localStorage.removeItem(SESSION_KEY(studentId))

    // 오늘 날짜 초기화 (없으면 0으로)
    if (!log[today]) {
      log[today] = 0
      saveLog(studentId, log)
    }
  } catch {
    localStorage.removeItem(SESSION_KEY(studentId))
  }
}

/** 현재 세션 중인지 확인 */
export function isStudying(studentId: string): boolean {
  return !!localStorage.getItem(SESSION_KEY(studentId))
}

/**
 * 최근 7일 학습 데이터 반환
 * - 오늘 날짜: 현재 세션 포함한 실시간 값
 * - 이전 날짜: 확정된 값
 */
export function getWeeklyStudyData(studentId: string): Array<{ date: string; studyMinutes: number }> {
  const log = getLog(studentId)
  const today = getToday()

  // 현재 진행 중인 세션 시간 계산
  let currentSessionMinutes = 0
  try {
    const raw = localStorage.getItem(SESSION_KEY(studentId))
    if (raw) {
      const session: StudySession = JSON.parse(raw)
      if (session.date === today) {
        const elapsed = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 60000)
        currentSessionMinutes = elapsed
      }
    }
  } catch { /* ignore */ }

  const result = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const stored = log[dateStr] ?? 0
    const minutes = dateStr === today ? stored + currentSessionMinutes : stored
    result.push({ date: dateStr, studyMinutes: minutes })
  }
  return result
}

/** 오늘 학습 시간 (분) */
export function getTodayStudyMinutes(studentId: string): number {
  const data = getWeeklyStudyData(studentId)
  const today = getToday()
  return data.find((d) => d.date === today)?.studyMinutes ?? 0
}
