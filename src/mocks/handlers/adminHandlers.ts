import { http, HttpResponse } from 'msw'
import {
  getStudentDB, getCourseDB, getEnrollmentDB, getGradeDB, getAttendanceDB,
  persistDB, scoreToGrade, gradeToGpa,
  type StudentRecord, type GradeRecord, type EnrollmentRecord, type AttendanceRecord,
} from '../fixtures/db'

export const adminHandlers = [

  // ═══════════════════════════════════════════════════════
  // 학생 관리
  // ═══════════════════════════════════════════════════════

  http.get('/admin/students', () => {
    return HttpResponse.json(getStudentDB())
  }),

  http.post('/admin/students', async ({ request }) => {
    const body = await request.json() as StudentRecord
    if (!body.studentId || !body.name || !body.department) {
      return HttpResponse.json({ message: '필수 항목 누락' }, { status: 400 })
    }
    const students = getStudentDB()
    if (students.find((s) => s.studentId === body.studentId)) {
      return HttpResponse.json({ message: '이미 존재하는 학번' }, { status: 409 })
    }
    students.push({ ...body, isRegistered: false })
    persistDB.students(students)
    return HttpResponse.json(body, { status: 201 })
  }),

  http.put('/admin/students/:studentId', async ({ request, params }) => {
    const studentId = params.studentId as string
    const body = await request.json() as Partial<StudentRecord>
    const students = getStudentDB()
    const idx = students.findIndex((s) => s.studentId === studentId)
    if (idx === -1) return HttpResponse.json({ message: '학생 없음' }, { status: 404 })
    students[idx] = { ...students[idx], ...body }
    persistDB.students(students)
    return HttpResponse.json(students[idx])
  }),

  http.delete('/admin/students/:studentId', ({ params }) => {
    const studentId = params.studentId as string
    const students = getStudentDB()
    const idx = students.findIndex((s) => s.studentId === studentId)
    if (idx === -1) return HttpResponse.json({ message: '학생 없음' }, { status: 404 })
    students.splice(idx, 1)
    persistDB.students(students)

    const enrollments = getEnrollmentDB().filter((e) => e.studentId !== studentId)
    persistDB.enrollments(enrollments)
    const grades = getGradeDB().filter((g) => g.studentId !== studentId)
    persistDB.grades(grades)
    const attendance = getAttendanceDB().filter((a) => a.studentId !== studentId)
    persistDB.attendance(attendance)

    return new HttpResponse(null, { status: 204 })
  }),

  // ═══════════════════════════════════════════════════════
  // 강의 관리
  // ═══════════════════════════════════════════════════════

  http.get('/admin/courses', () => {
    return HttpResponse.json(getCourseDB())
  }),

  // ═══════════════════════════════════════════════════════
  // 수강 관리
  // ═══════════════════════════════════════════════════════

  http.get('/admin/enrollments/:studentId', ({ params }) => {
    const studentId = params.studentId as string
    const courses = getCourseDB()
    const enrollments = getEnrollmentDB()
      .filter((e) => e.studentId === studentId)
      .map((e) => {
        const course = courses.find((c) => c.courseId === e.courseId)
        return { ...e, courseName: course?.title ?? '', credits: course?.credits ?? 3, professorName: course?.professorName ?? '' }
      })
    return HttpResponse.json(enrollments)
  }),

  http.post('/admin/enrollments', async ({ request }) => {
    const body = await request.json() as EnrollmentRecord
    const enrollments = getEnrollmentDB()
    const exists = enrollments.find(
      (e) => e.studentId === body.studentId && e.courseId === body.courseId
    )
    if (exists) return HttpResponse.json({ message: '이미 수강 중' }, { status: 409 })
    enrollments.push(body)
    persistDB.enrollments(enrollments)

    const attendance = getAttendanceDB()
    attendance.push({ studentId: body.studentId, courseId: body.courseId, attendedCount: 0, totalCount: 15, rate: 0 })
    persistDB.attendance(attendance)

    return HttpResponse.json(body, { status: 201 })
  }),

  http.delete('/admin/enrollments/:studentId/:courseId', ({ params }) => {
    const { studentId, courseId } = params as { studentId: string; courseId: string }
    const enrollments = getEnrollmentDB()
    const idx = enrollments.findIndex((e) => e.studentId === studentId && e.courseId === courseId)
    if (idx === -1) return HttpResponse.json({ message: '수강 없음' }, { status: 404 })
    enrollments.splice(idx, 1)
    persistDB.enrollments(enrollments)

    const grades = getGradeDB().filter((g) => !(g.studentId === studentId && g.courseId === courseId))
    persistDB.grades(grades)
    const attendance = getAttendanceDB().filter((a) => !(a.studentId === studentId && a.courseId === courseId))
    persistDB.attendance(attendance)

    return new HttpResponse(null, { status: 204 })
  }),

  // ═══════════════════════════════════════════════════════
  // 성적 관리
  // ═══════════════════════════════════════════════════════

  http.get('/admin/grades/:studentId', ({ params }) => {
    const studentId = params.studentId as string
    const courses = getCourseDB()
    const grades = getGradeDB()
      .filter((g) => g.studentId === studentId)
      .map((g) => {
        const course = courses.find((c) => c.courseId === g.courseId)
        return { ...g, courseName: course?.title ?? '', credits: course?.credits ?? 3, professorName: course?.professorName ?? '' }
      })
    return HttpResponse.json(grades)
  }),

  http.put('/admin/grades/:studentId/:courseId', async ({ request, params }) => {
    const { studentId, courseId } = params as { studentId: string; courseId: string }
    const body = await request.json() as { score: number; semester: string }
    const gradeStr = scoreToGrade(body.score)
    const gpa = gradeToGpa(gradeStr)
    const grades = getGradeDB()
    const idx = grades.findIndex((g) => g.studentId === studentId && g.courseId === courseId)
    const record: GradeRecord = { studentId, courseId, semester: body.semester, score: body.score, gradeStr, gpa }
    if (idx === -1) grades.push(record)
    else grades[idx] = record
    persistDB.grades(grades)
    return HttpResponse.json(record)
  }),

  http.delete('/admin/grades/:studentId/:courseId', ({ params }) => {
    const { studentId, courseId } = params as { studentId: string; courseId: string }
    const grades = getGradeDB()
    const idx = grades.findIndex((g) => g.studentId === studentId && g.courseId === courseId)
    if (idx === -1) return HttpResponse.json({ message: '성적 없음' }, { status: 404 })
    grades.splice(idx, 1)
    persistDB.grades(grades)
    return new HttpResponse(null, { status: 204 })
  }),

  // ═══════════════════════════════════════════════════════
  // 출석 관리
  // ═══════════════════════════════════════════════════════

  http.get('/admin/attendance/:studentId', ({ params }) => {
    const studentId = params.studentId as string
    const courses = getCourseDB()
    const records = getAttendanceDB()
      .filter((a) => a.studentId === studentId)
      .map((a) => {
        const course = courses.find((c) => c.courseId === a.courseId)
        return { ...a, courseName: course?.title ?? '', professorName: course?.professorName ?? '' }
      })
    return HttpResponse.json(records)
  }),

  http.put('/admin/attendance/:studentId/:courseId', async ({ request, params }) => {
    const { studentId, courseId } = params as { studentId: string; courseId: string }
    const body = await request.json() as { attendedCount: number; totalCount: number }
    const rate = body.totalCount > 0 ? Math.round((body.attendedCount / body.totalCount) * 1000) / 10 : 0
    const attendance = getAttendanceDB()
    const idx = attendance.findIndex((a) => a.studentId === studentId && a.courseId === courseId)
    const record: AttendanceRecord = { studentId, courseId, ...body, rate }
    if (idx === -1) attendance.push(record)
    else attendance[idx] = record
    persistDB.attendance(attendance)
    return HttpResponse.json(record)
  }),
]
