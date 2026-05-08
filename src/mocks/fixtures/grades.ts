// 하위 호환성 유지 — 실제 데이터는 db.ts에서 관리
export type { GradeRecord as GradeItem } from './db'
export { gradeDB as mockGrades, scoreToGrade, gradeToGpa, calcGpa } from './db'

// calcEarnedCredits 하위 호환
import { gradeDB } from './db'
export function calcEarnedCredits(grades: typeof gradeDB): number {
  return grades.filter((g) => g.gradeStr !== 'F').reduce((s, _g) => s + 3, 0)
}
