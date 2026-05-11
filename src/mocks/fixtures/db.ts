/**
 * 중앙 공유 DB — localStorage 영구 저장
 * 관리자가 추가/수정/삭제한 데이터가 새로고침 후에도 유지됩니다.
 */

// ─── 타입 정의 ───────────────────────────────────────────────

export interface StudentRecord {
  studentId: string
  name: string
  department: string
  grade: '1' | '2' | '3' | '4'
  status: '재학' | '휴학' | '졸업' | '제적'
  isRegistered: boolean
  email?: string
  phone?: string
  admissionYear: string
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
  score: number
  gradeStr: string
  gpa: number
}

export interface AttendanceRecord {
  studentId: string
  courseId: string
  attendedCount: number
  totalCount: number
  rate: number
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

// ─── localStorage 헬퍼 ───────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data))
}

// ─── 초기 학생 데이터 ─────────────────────────────────────────

const INITIAL_STUDENTS: StudentRecord[] = [
  // 컴퓨터소프트웨어공학과
  { studentId: '20240001', name: '이현규', department: '컴퓨터소프트웨어공학과', grade: '1', status: '재학', isRegistered: true,  email: 'hyunkyu@hyungyu.ac.kr', phone: '010-1234-5678', admissionYear: '2024' },
  { studentId: '20240002', name: '홍길동', department: '컴퓨터소프트웨어공학과', grade: '1', status: '재학', isRegistered: false, admissionYear: '2024' },
  { studentId: '20240003', name: '김민수', department: '컴퓨터소프트웨어공학과', grade: '1', status: '재학', isRegistered: false, admissionYear: '2024' },
  { studentId: '20230001', name: '박민준', department: '컴퓨터소프트웨어공학과', grade: '2', status: '재학', isRegistered: false, admissionYear: '2023' },
  { studentId: '20230002', name: '최지우', department: '컴퓨터소프트웨어공학과', grade: '2', status: '재학', isRegistered: false, admissionYear: '2023' },
  { studentId: '20220001', name: '정다은', department: '컴퓨터소프트웨어공학과', grade: '3', status: '재학', isRegistered: false, admissionYear: '2022' },
  // 간호학과
  { studentId: '20240101', name: '이수진', department: '간호학과', grade: '1', status: '재학', isRegistered: false, admissionYear: '2024' },
  { studentId: '20240102', name: '김하늘', department: '간호학과', grade: '1', status: '재학', isRegistered: false, admissionYear: '2024' },
  { studentId: '20230101', name: '박서연', department: '간호학과', grade: '2', status: '재학', isRegistered: false, admissionYear: '2023' },
  { studentId: '20230102', name: '윤지민', department: '간호학과', grade: '2', status: '휴학', isRegistered: false, admissionYear: '2023' },
  { studentId: '20220101', name: '강예린', department: '간호학과', grade: '3', status: '재학', isRegistered: false, admissionYear: '2022' },
]

// ─── 초기 강의 데이터 ─────────────────────────────────────────

const INITIAL_COURSES: CourseRecord[] = [
  // 컴퓨터소프트웨어공학과 강의
  { courseId: 'cs101', title: '자료구조',       professorName: '김교수', credits: 3, semester: '2024-1', department: '컴퓨터소프트웨어공학과', maxStudents: 40 },
  { courseId: 'cs102', title: '프로그래밍기초',  professorName: '이교수', credits: 3, semester: '2024-1', department: '컴퓨터소프트웨어공학과', maxStudents: 45 },
  { courseId: 'cs201', title: '알고리즘',        professorName: '박교수', credits: 3, semester: '2024-1', department: '컴퓨터소프트웨어공학과', maxStudents: 35 },
  { courseId: 'cs202', title: '객체지향프로그래밍', professorName: '최교수', credits: 3, semester: '2024-1', department: '컴퓨터소프트웨어공학과', maxStudents: 40 },
  { courseId: 'cs301', title: '운영체제',        professorName: '이교수', credits: 3, semester: '2024-1', department: '컴퓨터소프트웨어공학과', maxStudents: 40 },
  { courseId: 'cs302', title: '컴퓨터구조',      professorName: '정교수', credits: 3, semester: '2024-1', department: '컴퓨터소프트웨어공학과', maxStudents: 35 },
  { courseId: 'cs401', title: '데이터베이스',    professorName: '최교수', credits: 3, semester: '2024-1', department: '컴퓨터소프트웨어공학과', maxStudents: 35 },
  { courseId: 'cs402', title: '웹프로그래밍',    professorName: '강교수', credits: 3, semester: '2024-1', department: '컴퓨터소프트웨어공학과', maxStudents: 40 },
  { courseId: 'cs501', title: '네트워크',        professorName: '정교수', credits: 3, semester: '2024-1', department: '컴퓨터소프트웨어공학과', maxStudents: 30 },
  { courseId: 'cs601', title: '소프트웨어공학',  professorName: '강교수', credits: 3, semester: '2024-1', department: '컴퓨터소프트웨어공학과', maxStudents: 40 },
  // 간호학과 강의
  { courseId: 'nu101', title: '기초간호학',      professorName: '김간호교수', credits: 3, semester: '2024-1', department: '간호학과', maxStudents: 40 },
  { courseId: 'nu102', title: '해부생리학',      professorName: '이간호교수', credits: 3, semester: '2024-1', department: '간호학과', maxStudents: 40 },
  { courseId: 'nu201', title: '성인간호학I',     professorName: '박간호교수', credits: 3, semester: '2024-1', department: '간호학과', maxStudents: 35 },
  { courseId: 'nu202', title: '기본간호실습',    professorName: '최간호교수', credits: 2, semester: '2024-1', department: '간호학과', maxStudents: 30 },
  { courseId: 'nu301', title: '아동간호학',      professorName: '정간호교수', credits: 3, semester: '2024-1', department: '간호학과', maxStudents: 35 },
  { courseId: 'nu302', title: '정신간호학',      professorName: '강간호교수', credits: 3, semester: '2024-1', department: '간호학과', maxStudents: 35 },
  { courseId: 'nu401', title: '지역사회간호학',  professorName: '윤간호교수', credits: 3, semester: '2024-1', department: '간호학과', maxStudents: 40 },
  { courseId: 'nu402', title: '간호관리학',      professorName: '한간호교수', credits: 3, semester: '2024-1', department: '간호학과', maxStudents: 40 },
]

// ─── 초기 수강신청 데이터 ─────────────────────────────────────

const INITIAL_ENROLLMENTS: EnrollmentRecord[] = [
  // 이현규 (20240001) — 컴공과 1학년
  { studentId: '20240001', courseId: 'cs101', semester: '2024-1' },
  { studentId: '20240001', courseId: 'cs102', semester: '2024-1' },
  { studentId: '20240001', courseId: 'cs201', semester: '2024-1' },
  { studentId: '20240001', courseId: 'cs401', semester: '2024-1' },
  { studentId: '20240001', courseId: 'cs501', semester: '2024-1' },
  { studentId: '20240001', courseId: 'cs601', semester: '2024-1' },
  // 홍길동 (20240002) — 컴공과 1학년
  { studentId: '20240002', courseId: 'cs101', semester: '2024-1' },
  { studentId: '20240002', courseId: 'cs102', semester: '2024-1' },
  { studentId: '20240002', courseId: 'cs202', semester: '2024-1' },
  // 박민준 (20230001) — 컴공과 2학년
  { studentId: '20230001', courseId: 'cs201', semester: '2024-1' },
  { studentId: '20230001', courseId: 'cs301', semester: '2024-1' },
  { studentId: '20230001', courseId: 'cs302', semester: '2024-1' },
  { studentId: '20230001', courseId: 'cs401', semester: '2024-1' },
  // 이수진 (20240101) — 간호학과 1학년
  { studentId: '20240101', courseId: 'nu101', semester: '2024-1' },
  { studentId: '20240101', courseId: 'nu102', semester: '2024-1' },
  // 박서연 (20230101) — 간호학과 2학년
  { studentId: '20230101', courseId: 'nu201', semester: '2024-1' },
  { studentId: '20230101', courseId: 'nu202', semester: '2024-1' },
  { studentId: '20230101', courseId: 'nu301', semester: '2024-1' },
]

// ─── 초기 성적 데이터 ─────────────────────────────────────────

const INITIAL_GRADES: GradeRecord[] = [
  // 이현규 (20240001)
  { studentId: '20240001', courseId: 'cs101', semester: '2024-1', score: 88, gradeStr: 'B+', gpa: 3.5 },
  { studentId: '20240001', courseId: 'cs102', semester: '2024-1', score: 94, gradeStr: 'A',  gpa: 4.0 },
  { studentId: '20240001', courseId: 'cs201', semester: '2024-1', score: 72, gradeStr: 'C',  gpa: 2.0 },
  { studentId: '20240001', courseId: 'cs401', semester: '2024-1', score: 81, gradeStr: 'B',  gpa: 3.0 },
  { studentId: '20240001', courseId: 'cs501', semester: '2024-1', score: 65, gradeStr: 'D+', gpa: 1.5 },
  { studentId: '20240001', courseId: 'cs601', semester: '2024-1', score: 92, gradeStr: 'A',  gpa: 4.0 },
  // 홍길동 (20240002)
  { studentId: '20240002', courseId: 'cs101', semester: '2024-1', score: 76, gradeStr: 'C+', gpa: 2.5 },
  { studentId: '20240002', courseId: 'cs102', semester: '2024-1', score: 83, gradeStr: 'B',  gpa: 3.0 },
  // 박민준 (20230001)
  { studentId: '20230001', courseId: 'cs201', semester: '2024-1', score: 91, gradeStr: 'A',  gpa: 4.0 },
  { studentId: '20230001', courseId: 'cs301', semester: '2024-1', score: 85, gradeStr: 'B+', gpa: 3.5 },
  { studentId: '20230001', courseId: 'cs302', semester: '2024-1', score: 78, gradeStr: 'C+', gpa: 2.5 },
  { studentId: '20230001', courseId: 'cs401', semester: '2024-1', score: 96, gradeStr: 'A+', gpa: 4.5 },
  // 이수진 (20240101)
  { studentId: '20240101', courseId: 'nu101', semester: '2024-1', score: 89, gradeStr: 'B+', gpa: 3.5 },
  { studentId: '20240101', courseId: 'nu102', semester: '2024-1', score: 77, gradeStr: 'C+', gpa: 2.5 },
  // 박서연 (20230101)
  { studentId: '20230101', courseId: 'nu201', semester: '2024-1', score: 93, gradeStr: 'A',  gpa: 4.0 },
  { studentId: '20230101', courseId: 'nu202', semester: '2024-1', score: 88, gradeStr: 'B+', gpa: 3.5 },
  { studentId: '20230101', courseId: 'nu301', semester: '2024-1', score: 70, gradeStr: 'C',  gpa: 2.0 },
]

// ─── 초기 출석 데이터 ─────────────────────────────────────────

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // 이현규 (20240001)
  { studentId: '20240001', courseId: 'cs101', attendedCount: 12, totalCount: 15, rate: 80.0 },
  { studentId: '20240001', courseId: 'cs102', attendedCount: 15, totalCount: 15, rate: 100.0 },
  { studentId: '20240001', courseId: 'cs201', attendedCount: 10, totalCount: 15, rate: 66.7 },
  { studentId: '20240001', courseId: 'cs401', attendedCount: 13, totalCount: 15, rate: 86.7 },
  { studentId: '20240001', courseId: 'cs501', attendedCount: 8,  totalCount: 15, rate: 53.3 },
  { studentId: '20240001', courseId: 'cs601', attendedCount: 14, totalCount: 15, rate: 93.3 },
  // 홍길동 (20240002)
  { studentId: '20240002', courseId: 'cs101', attendedCount: 14, totalCount: 15, rate: 93.3 },
  { studentId: '20240002', courseId: 'cs102', attendedCount: 11, totalCount: 15, rate: 73.3 },
  { studentId: '20240002', courseId: 'cs202', attendedCount: 13, totalCount: 15, rate: 86.7 },
  // 박민준 (20230001)
  { studentId: '20230001', courseId: 'cs201', attendedCount: 15, totalCount: 15, rate: 100.0 },
  { studentId: '20230001', courseId: 'cs301', attendedCount: 12, totalCount: 15, rate: 80.0 },
  { studentId: '20230001', courseId: 'cs302', attendedCount: 9,  totalCount: 15, rate: 60.0 },
  { studentId: '20230001', courseId: 'cs401', attendedCount: 14, totalCount: 15, rate: 93.3 },
  // 이수진 (20240101)
  { studentId: '20240101', courseId: 'nu101', attendedCount: 13, totalCount: 15, rate: 86.7 },
  { studentId: '20240101', courseId: 'nu102', attendedCount: 15, totalCount: 15, rate: 100.0 },
  // 박서연 (20230101)
  { studentId: '20230101', courseId: 'nu201', attendedCount: 14, totalCount: 15, rate: 93.3 },
  { studentId: '20230101', courseId: 'nu202', attendedCount: 12, totalCount: 15, rate: 80.0 },
  { studentId: '20230101', courseId: 'nu301', attendedCount: 10, totalCount: 15, rate: 66.7 },
]

// ─── localStorage 키 ─────────────────────────────────────────

const KEYS = {
  students:    'mock-db-students',
  courses:     'mock-db-courses',
  enrollments: 'mock-db-enrollments',
  grades:      'mock-db-grades',
  attendance:  'mock-db-attendance',
}

// ─── DB 인스턴스 (localStorage에서 로드, 없으면 초기값) ───────
// 기존 localStorage 데이터가 있어도 새 강의/학생이 추가됐을 수 있으므로
// 초기값에만 있는 항목을 병합합니다.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mergeById<T extends Record<string, any>>(
  stored: T[],
  initial: T[],
  idKey: keyof T,
): T[] {
  const result = [...stored]
  for (const item of initial) {
    const exists = stored.some((s) => s[idKey] === item[idKey])
    if (!exists) result.push(item)
  }
  return result
}

const storedStudents    = load<StudentRecord[]>(KEYS.students,    [])
const storedCourses     = load<CourseRecord[]>(KEYS.courses,      [])
const storedEnrollments = load<EnrollmentRecord[]>(KEYS.enrollments, [])
const storedGrades      = load<GradeRecord[]>(KEYS.grades,        [])
const storedAttendance  = load<AttendanceRecord[]>(KEYS.attendance, [])

// localStorage에 데이터가 있으면 그대로 사용하고, 초기값에만 있는 항목 추가
// localStorage에 아무것도 없으면 (null) 초기값 사용
const hasStoredStudents    = localStorage.getItem(KEYS.students) !== null
const hasStoredCourses     = localStorage.getItem(KEYS.courses) !== null
const hasStoredEnrollments = localStorage.getItem(KEYS.enrollments) !== null
const hasStoredGrades      = localStorage.getItem(KEYS.grades) !== null
const hasStoredAttendance  = localStorage.getItem(KEYS.attendance) !== null

export const studentDB:    StudentRecord[]    = hasStoredStudents    ? mergeById(storedStudents,    INITIAL_STUDENTS,    'studentId') : [...INITIAL_STUDENTS]
export const courseDB:     CourseRecord[]     = hasStoredCourses     ? mergeById(storedCourses,     INITIAL_COURSES,     'courseId')  : [...INITIAL_COURSES]
export const enrollmentDB: EnrollmentRecord[] = hasStoredEnrollments ? [...storedEnrollments]                                         : [...INITIAL_ENROLLMENTS]
export const gradeDB:      GradeRecord[]      = hasStoredGrades      ? [...storedGrades]                                              : [...INITIAL_GRADES]
export const attendanceDB: AttendanceRecord[] = hasStoredAttendance  ? [...storedAttendance]                                          : [...INITIAL_ATTENDANCE]

// ─── 저장 함수 (핸들러에서 변경 후 호출) ─────────────────────

export const persistDB = {
  students:    () => save(KEYS.students,    studentDB),
  courses:     () => save(KEYS.courses,     courseDB),
  enrollments: () => save(KEYS.enrollments, enrollmentDB),
  grades:      () => save(KEYS.grades,      gradeDB),
  attendance:  () => save(KEYS.attendance,  attendanceDB),
}

// ─── 항상 최신 localStorage 데이터를 반환하는 getter ─────────
// npm run dev 재시작 후에도 localStorage에서 직접 읽어서 최신 상태 보장

export function getStudentDB(): StudentRecord[] {
  const stored = load<StudentRecord[]>(KEYS.students, [])
  if (localStorage.getItem(KEYS.students) !== null) {
    return mergeById(stored, INITIAL_STUDENTS, 'studentId')
  }
  return [...INITIAL_STUDENTS]
}

export function getCourseDB(): CourseRecord[] {
  const stored = load<CourseRecord[]>(KEYS.courses, [])
  if (localStorage.getItem(KEYS.courses) !== null) {
    return mergeById(stored, INITIAL_COURSES, 'courseId')
  }
  return [...INITIAL_COURSES]
}
