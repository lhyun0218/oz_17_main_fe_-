/**
 * 중앙 공유 DB
 * 관리자 핸들러와 학생 핸들러가 동일한 객체를 참조하므로
 * 관리자가 수정하면 학생 화면에 즉시 반영됩니다.
 */

// ─── 타입 정의 ───────────────────────────────────────────────

export interface StudentRecord {
  studentId: string
  name: string
  department: string
  grade: '1' | '2' | '3' | '4'   // 학년
  status: '재학' | '휴학' | '졸업' | '제적'
  isRegistered: boolean
  email?: string
  phone?: string
  admissionYear: string           // 입학년도
}

export interface CourseRecord {
  courseId: string
  title: string
  professorName: string
  credits: number
  semester: string
  department: string
  maxStudents: number
}

export interface EnrollmentRecord {
  studentId: string
  courseId: string
  semester: string
}

export interface GradeRecord {
  studentId: string
  courseId: string
  semester: string
  score: number       // 0~100
  gradeStr: string    // A+, A, B+, ...
  gpa: number         // 4.5 기준
}

export interface AttendanceRecord {
  studentId: string
  courseId: string
  attendedCount: number
  totalCount: number
  rate: number        // 0~100
}

// ─── 유틸 함수 ───────────────────────────────────────────────

export function scoreToGrade(score: number): string {
  if (score >= 95) return 'A+'
  if (score >= 90) return 'A'
  if (score >= 85) return 'B+'
  if (score >= 80) return 'B'
  if (score >= 75) return 'C+'
  if (score >= 70) return 'C'
  if (score >= 65) return 'D+'
  if (score >= 60) return 'D'
  return 'F'
}

export function gradeToGpa(grade: string): number {
  const map: Record<string, number> = {
    'A+': 4.5, 'A': 4.0, 'B+': 3.5, 'B': 3.0,
    'C+': 2.5, 'C': 2.0, 'D+': 1.5, 'D': 1.0, 'F': 0.0,
  }
  return map[grade] ?? 0.0
}

export function calcGpa(grades: GradeRecord[]): number {
  const totalCredits = grades.reduce((s, g) => {
    const course = courseDB.find((c) => c.courseId === g.courseId)
    return s + (course?.credits ?? 3)
  }, 0)
  if (totalCredits === 0) return 0
  const totalPoints = grades.reduce((s, g) => {
    const course = courseDB.find((c) => c.courseId === g.courseId)
    return s + g.gpa * (course?.credits ?? 3)
  }, 0)
  return Math.round((totalPoints / totalCredits) * 100) / 100
}

// ─── 학생 DB ─────────────────────────────────────────────────

export const studentDB: StudentRecord[] = [
  { studentId: '20240001', name: '이현규', department: '컴퓨터소프트웨어공학', grade: '1', status: '재학', isRegistered: true, email: 'hyunkyu@hyungyu.ac.kr', phone: '010-1234-5678', admissionYear: '2024' },
  { studentId: '20240002', name: '홍길동', department: '컴퓨터소프트웨어공학', grade: '1', status: '재학', isRegistered: false, admissionYear: '2024' },
  { studentId: '20240003', name: '김철수', department: '전자공학', grade: '1', status: '재학', isRegistered: false, admissionYear: '2024' },
  { studentId: '20240004', name: '이영희', department: '경영학', grade: '2', status: '휴학', isRegistered: false, admissionYear: '2023' },
  { studentId: '20230001', name: '박민준', department: '컴퓨터소프트웨어공학', grade: '2', status: '재학', isRegistered: false, admissionYear: '2023' },
]

// ─── 강의 DB ─────────────────────────────────────────────────

export const courseDB: CourseRecord[] = [
  { courseId: 'cs101', title: '자료구조', professorName: '김교수', credits: 3, semester: '2024-1', department: '컴퓨터소프트웨어공학', maxStudents: 40 },
  { courseId: 'cs201', title: '알고리즘', professorName: '박교수', credits: 3, semester: '2024-1', department: '컴퓨터소프트웨어공학', maxStudents: 35 },
  { courseId: 'cs301', title: '운영체제', professorName: '이교수', credits: 3, semester: '2024-1', department: '컴퓨터소프트웨어공학', maxStudents: 40 },
  { courseId: 'cs401', title: '데이터베이스', professorName: '최교수', credits: 3, semester: '2024-1', department: '컴퓨터소프트웨어공학', maxStudents: 35 },
  { courseId: 'cs501', title: '네트워크', professorName: '정교수', credits: 3, semester: '2024-1', department: '컴퓨터소프트웨어공학', maxStudents: 30 },
  { courseId: 'cs601', title: '소프트웨어공학', professorName: '강교수', credits: 3, semester: '2024-1', department: '컴퓨터소프트웨어공학', maxStudents: 40 },
]

// ─── 수강 신청 DB ─────────────────────────────────────────────

export const enrollmentDB: EnrollmentRecord[] = [
  { studentId: '20240001', courseId: 'cs101', semester: '2024-1' },
  { studentId: '20240001', courseId: 'cs201', semester: '2024-1' },
  { studentId: '20240001', courseId: 'cs301', semester: '2024-1' },
  { studentId: '20240001', courseId: 'cs401', semester: '2024-1' },
  { studentId: '20240001', courseId: 'cs501', semester: '2024-1' },
  { studentId: '20240001', courseId: 'cs601', semester: '2024-1' },
]

// ─── 성적 DB ─────────────────────────────────────────────────

export const gradeDB: GradeRecord[] = [
  { studentId: '20240001', courseId: 'cs101', semester: '2024-1', score: 88, gradeStr: 'B+', gpa: 3.5 },
  { studentId: '20240001', courseId: 'cs201', semester: '2024-1', score: 72, gradeStr: 'C', gpa: 2.0 },
  { studentId: '20240001', courseId: 'cs301', semester: '2024-1', score: 95, gradeStr: 'A+', gpa: 4.5 },
  { studentId: '20240001', courseId: 'cs401', semester: '2024-1', score: 81, gradeStr: 'B', gpa: 3.0 },
  { studentId: '20240001', courseId: 'cs501', semester: '2024-1', score: 65, gradeStr: 'D+', gpa: 1.5 },
  { studentId: '20240001', courseId: 'cs601', semester: '2024-1', score: 92, gradeStr: 'A', gpa: 4.0 },
]

// ─── 출석 DB ─────────────────────────────────────────────────

export const attendanceDB: AttendanceRecord[] = [
  { studentId: '20240001', courseId: 'cs101', attendedCount: 12, totalCount: 15, rate: 80 },
  { studentId: '20240001', courseId: 'cs201', attendedCount: 10, totalCount: 15, rate: 66.7 },
  { studentId: '20240001', courseId: 'cs301', attendedCount: 15, totalCount: 15, rate: 100 },
  { studentId: '20240001', courseId: 'cs401', attendedCount: 13, totalCount: 15, rate: 86.7 },
  { studentId: '20240001', courseId: 'cs501', attendedCount: 8, totalCount: 15, rate: 53.3 },
  { studentId: '20240001', courseId: 'cs601', attendedCount: 14, totalCount: 15, rate: 93.3 },
]
